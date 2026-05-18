"""文件上传路由"""
import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlmodel import Session

from app.database import get_db
from app.models import User
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/upload", tags=["上传"])


@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传头像（将图片转为 base64 存储）"""
    # 验证文件类型
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的文件类型，仅支持 JPEG、PNG、GIF、WebP",
        )

    # 验证文件大小并读取内容
    contents = file.file.read()
    if len(contents) > settings.maxAvatarSize:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过 {settings.maxAvatarSize // (1024 * 1024)}MB 限制",
        )

    # 将图片编码为 base64
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    mime_type = file.content_type or "image/jpeg"
    base64_data = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_data}"

    # 更新用户头像（存储完整的 data URL）
    user = db.get(User, current_user.id)
    if user:
        user.avatar_url = data_url
        db.add(user)
        db.commit()

    return {"url": data_url}
