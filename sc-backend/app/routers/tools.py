"""工具路由 — 图片压缩"""

import gc
import io
import os
import tempfile
import zipfile
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

from app.config import settings
from app.middleware.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/tools", tags=["工具"])

# 允许的 MIME 类型
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

# MIME 类型 → Pillow 格式名
TYPE_TO_FORMAT = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}


def _sanitize_filename(filename: str) -> str:
    """清理文件名，去除路径注入，保留基本名称"""
    return Path(filename).name if filename else "unknown"


def _get_unique_name(name: str, used: set) -> str:
    """处理文件名冲突：photo.jpg → photo_1.jpg → photo_2.jpg"""
    if name not in used:
        used.add(name)
        return name

    stem = Path(name).stem
    suffix = Path(name).suffix
    counter = 1
    while True:
        new_name = f"{stem}_{counter}{suffix}"
        if new_name not in used:
            used.add(new_name)
            return new_name
        counter += 1


def _compress_to_target_size(
    img: Image.Image,
    save_format: str,
    target_bytes: int,
    original_bytes: int,
) -> io.BytesIO | None:
    """二分查找最优 quality，将图片压缩到目标大小以下。

    返回压缩后的 BytesIO，若原图已小于目标则返回 None（跳过）。
    """
    if original_bytes <= target_bytes:
        return None

    # 二分查找能满足目标的最高 quality
    low, high = 1, 100
    best_buf = None
    while low <= high:
        mid = (low + high) // 2
        buf = io.BytesIO()
        img.save(buf, format=save_format, quality=mid)
        if len(buf.getvalue()) <= target_bytes:
            best_buf = buf
            low = mid + 1  # 尝试更高质量
        else:
            high = mid - 1  # 降低质量

    # quality=1 仍超目标，用 quality=1 尽力而为
    if best_buf is None:
        best_buf = io.BytesIO()
        img.save(best_buf, format=save_format, quality=1)

    best_buf.seek(0)
    return best_buf


def _convert_to_rgb_if_needed(img: Image.Image, target_format: str) -> Image.Image:
    """根据目标格式转换图片模式，避免 Pillow 保存时报错"""
    if target_format == "JPEG":
        # JPEG 不支持透明通道，需要合成到白色背景
        if img.mode in ("RGBA", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode == "P":
            img = img.convert("RGB")
        elif img.mode == "CMYK":
            img = img.convert("RGB")
    elif target_format == "WEBP":
        # WebP 支持 RGB 和 RGBA，但不支持 CMYK/P
        if img.mode == "CMYK":
            img = img.convert("RGB")
        elif img.mode == "P":
            img = img.convert("RGBA")
    elif target_format == "PNG":
        # PNG 支持多种模式，但 CMYK 需要转换
        if img.mode == "CMYK":
            img = img.convert("RGB")
    return img


@router.post("/compress")
def compress_images(
    files: List[UploadFile] = File(...),
    quality: int = Form(80, ge=1, le=100),
    output_format: str = Form("original"),
    compress_mode: str = Form("quality"),
    target_size_kb: int = Form(0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """批量压缩图片，返回 zip 文件流"""

    # 校验 output_format 参数
    if output_format not in ("original", "webp"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="output_format 必须为 'original' 或 'webp'",
        )

    # 校验 compress_mode 参数
    if compress_mode not in ("quality", "target_size"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="compress_mode 必须为 'quality' 或 'target_size'",
        )

    # 按目标大小模式需要有效的 target_size_kb
    if compress_mode == "target_size" and target_size_kb <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="按目标大小压缩时，target_size_kb 必须大于 0",
        )

    target_bytes = target_size_kb * 1024 if compress_mode == "target_size" else 0

    # 校验文件数量
    if len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="请至少上传一个文件",
        )
    if len(files) > settings.maxCompressFiles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"最多只能上传 {settings.maxCompressFiles} 个文件",
        )

    # 逐个校验和压缩
    used_names: set = set()
    total_size = 0

    # ponytail: 用临时文件代替内存 zip，避免 512MB 容器 OOM
    tmp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    with zipfile.ZipFile(tmp_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in files:
            # 校验文件类型
            if file.content_type not in ALLOWED_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"不支持的文件类型: {file.filename}（{file.content_type}），仅支持 JPG/PNG/WebP",
                )

            # 读取文件内容
            contents = file.file.read()
            file_size = len(contents)
            original_bytes_data = contents  # 保留原始字节，跳过压缩时直接写入 zip

            # 校验单文件大小
            if file_size > settings.maxCompressSize:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"文件 {file.filename} 大小超过 {settings.maxCompressSize // (1024 * 1024)}MB 限制",
                )

            # 校验总大小
            total_size += file_size
            if total_size > settings.maxCompressTotalSize:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"文件总大小超过 {settings.maxCompressTotalSize // (1024 * 1024)}MB 限制",
                )

            # 用 Pillow 打开并压缩
            try:
                img = Image.open(io.BytesIO(contents))
                img.load()  # 触发完整读取，捕获损坏文件
            except UnidentifiedImageError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"无法识别图片文件: {file.filename}",
                )
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"图片文件损坏或无法读取: {file.filename}",
                )

            # 确定输出格式和文件名
            if output_format == "webp":
                save_format = "WEBP"
                out_name = Path(_sanitize_filename(file.filename)).stem + ".webp"
            else:
                # PNG 转为 JPG（PNG 是无损格式，quality 参数无效，需转为有损格式）
                if file.content_type == "image/png":
                    save_format = "JPEG"
                    out_name = Path(_sanitize_filename(file.filename)).stem + ".jpg"
                else:
                    save_format = TYPE_TO_FORMAT[file.content_type]
                    out_name = _sanitize_filename(file.filename)

            # 转换图片模式
            img = _convert_to_rgb_if_needed(img, save_format)

            # 根据压缩模式处理
            if compress_mode == "target_size":
                compressed_buf = _compress_to_target_size(
                    img, save_format, target_bytes, file_size
                )
                if compressed_buf is None:
                    # 原图已小于目标，保留原始文件（不重新编码，避免文件变大）
                    out_name = _get_unique_name(out_name, used_names)
                    zf.writestr(out_name, original_bytes_data)
                    continue
            else:
                compressed_buf = io.BytesIO()
                img.save(compressed_buf, format=save_format, quality=quality)
                compressed_buf.seek(0)

            # 处理文件名冲突，写入 zip
            out_name = _get_unique_name(out_name, used_names)
            zf.writestr(out_name, compressed_buf.read())

            # 释放当前图片的内存引用
            img.close()
            contents = None
            original_bytes_data = None
            compressed_buf = None
            gc.collect()

    # ponytail: 流式返回临时文件，不在内存中持有整个 zip
    tmp_zip.seek(0)
    tmp_path = tmp_zip.name

    def iter_file():
        try:
            with open(tmp_path, "rb") as f:
                while chunk := f.read(65536):
                    yield chunk
        finally:
            os.unlink(tmp_path)

    return StreamingResponse(
        iter_file(),
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="compressed.zip"',
        },
    )
