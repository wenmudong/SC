"""
图片压缩接口测试（TDD RED 阶段）

接口：POST /api/tools/compress
功能：上传图片文件，按指定质量和格式压缩，返回 zip 文件
认证：需要 JWT token
"""
import io
import zipfile

import pytest
import pytest_asyncio
from httpx import AsyncClient
from PIL import Image


# ---------------------------------------------------------------------------
# 辅助函数
# ---------------------------------------------------------------------------

def create_test_image(
    fmt: str = "JPEG",
    size: tuple = (100, 100),
    color: str = "red",
) -> bytes:
    """创建测试图片，返回 bytes 数据"""
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    buf.seek(0)
    return buf.getvalue()


def create_noisy_image(width: int = 800, height: int = 800) -> bytes:
    """创建随机噪声图片（JPEG 压缩率低，体积较大）"""
    import random
    pixels = bytes(random.randint(0, 255) for _ in range(width * height * 3))
    img = Image.frombytes("RGB", (width, height), pixels)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf.getvalue()


def create_large_test_image() -> bytes:
    """创建超过 20MB 的测试图片（用于文件大小限制测试）

    使用大量随机像素，JPEG 压缩率极低，确保压缩后仍超过 20MB。
    """
    import random
    side = 4000
    pixels = bytes(
        random.randint(0, 255) for _ in range(side * side * 3)
    )
    img = Image.frombytes("RGB", (side, side), pixels)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=100)
    buf.seek(0)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def auth_token(client: AsyncClient) -> str:
    """注册或登录测试用户，返回有效 JWT token

    由于测试共享数据库，首次调用注册用户，后续调用直接登录。
    """
    user_data = {
        "username": "compress_tst",
        "email": "compress_test@example.com",
        "password": "testpass123",
    }
    # 尝试注册
    resp = await client.post("/api/auth/register", json=user_data)
    if resp.status_code == 200:
        return resp.json()["access_token"]
    # 注册失败（已存在），尝试登录
    login_resp = await client.post(
        "/api/auth/login",
        json={"username": user_data["username"], "password": user_data["password"]},
    )
    assert login_resp.status_code == 200, f"登录失败: {login_resp.text}"
    return login_resp.json()["access_token"]


@pytest.fixture
def jpeg_bytes() -> bytes:
    """返回一张 JPEG 测试图片 bytes"""
    return create_test_image(fmt="JPEG", size=(200, 200), color="red")


@pytest.fixture
def png_bytes() -> bytes:
    """返回一张 PNG 测试图片 bytes"""
    return create_test_image(fmt="PNG", size=(200, 200), color="green")


@pytest.fixture
def webp_bytes() -> bytes:
    """返回一张 WebP 测试图片 bytes"""
    return create_test_image(fmt="WEBP", size=(200, 200), color="blue")


# ---------------------------------------------------------------------------
# 压缩接口地址
# ---------------------------------------------------------------------------

COMPRESS_URL = "/api/tools/compress"


# ---------------------------------------------------------------------------
# 测试用例
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_compress_requires_auth(client: AsyncClient):
    """测试未携带 token 时返回 401"""
    image_data = create_test_image()
    resp = await client.post(
        COMPRESS_URL,
        files=[("files", ("test.jpg", image_data, "image/jpeg"))],
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_compress_single_jpg(
    client: AsyncClient, auth_token: str, jpeg_bytes: bytes,
):
    """上传 1 张 JPEG，quality=80，format=original → 200，zip 含 1 个 .jpg"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("photo.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"

    # 验证 zip 内容
    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0].endswith(".jpg")


@pytest.mark.asyncio
async def test_compress_single_png_to_webp(
    client: AsyncClient, auth_token: str, png_bytes: bytes,
):
    """上传 1 张 PNG，quality=75，format=webp → 200，zip 含 1 个 .webp"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("image.png", png_bytes, "image/png"))],
        data={"quality": "75", "output_format": "webp"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0].endswith(".webp")


@pytest.mark.asyncio
async def test_compress_multiple_files(
    client: AsyncClient,
    auth_token: str,
    jpeg_bytes: bytes,
    png_bytes: bytes,
    webp_bytes: bytes,
):
    """上传 JPG+PNG+WebP 各 1 张 → 200，zip 含 3 个文件"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    files = [
        ("files", ("a.jpg", jpeg_bytes, "image/jpeg")),
        ("files", ("b.png", png_bytes, "image/png")),
        ("files", ("c.webp", webp_bytes, "image/webp")),
    ]
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=files,
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 3


@pytest.mark.asyncio
async def test_compress_quality_boundaries(
    client: AsyncClient, auth_token: str, jpeg_bytes: bytes,
):
    """quality=1 和 quality=100 都能成功"""
    headers = {"Authorization": f"Bearer {auth_token}"}

    # 最低质量
    resp_low = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("low.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "1", "output_format": "original"},
    )
    assert resp_low.status_code == 200

    # 最高质量
    resp_high = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("high.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "100", "output_format": "original"},
    )
    assert resp_high.status_code == 200


@pytest.mark.asyncio
async def test_compress_invalid_quality(
    client: AsyncClient, auth_token: str, jpeg_bytes: bytes,
):
    """quality=0 或 quality=101 → 422（参数校验失败）"""
    headers = {"Authorization": f"Bearer {auth_token}"}

    resp_zero = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("test.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "0", "output_format": "original"},
    )
    assert resp_zero.status_code == 422

    resp_over = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("test.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "101", "output_format": "original"},
    )
    assert resp_over.status_code == 422


@pytest.mark.asyncio
async def test_compress_invalid_format(
    client: AsyncClient, auth_token: str,
):
    """上传 .txt 文件 → 400（不支持的文件类型）"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    txt_content = b"this is not an image"
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("readme.txt", txt_content, "text/plain"))],
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_compress_preserves_filename(
    client: AsyncClient, auth_token: str, jpeg_bytes: bytes,
):
    """上传 'test_photo.jpg' → zip 中文件名也是 'test_photo.jpg'"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("test_photo.jpg", jpeg_bytes, "image/jpeg"))],
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0] == "test_photo.jpg"


@pytest.mark.asyncio
async def test_compress_png_to_jpg_original(
    client: AsyncClient, auth_token: str, png_bytes: bytes,
):
    """上传 PNG + format=original → zip 中为 .jpg（PNG 是无损格式，转为有损的 JPG）"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("photo.png", png_bytes, "image/png"))],
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0] == "photo.jpg"


@pytest.mark.asyncio
async def test_compress_quality_affects_png(
    client: AsyncClient, auth_token: str, png_bytes: bytes,
):
    """quality=1 和 quality=100 对 PNG 的压缩结果大小应有差异"""
    headers = {"Authorization": f"Bearer {auth_token}"}

    resp_low = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("low.png", png_bytes, "image/png"))],
        data={"quality": "1", "output_format": "original"},
    )
    resp_high = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("high.png", png_bytes, "image/png"))],
        data={"quality": "100", "output_format": "original"},
    )
    assert resp_low.status_code == 200
    assert resp_high.status_code == 200

    # 低质量的 zip 应该比高质量的 zip 小
    assert len(resp_low.content) < len(resp_high.content)


@pytest.mark.asyncio
async def test_compress_webp_conversion_renames(
    client: AsyncClient, auth_token: str, png_bytes: bytes,
):
    """上传 'image.png' + format=webp → zip 中为 'image.webp'"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("image.png", png_bytes, "image/png"))],
        data={"quality": "80", "output_format": "webp"},
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0] == "image.webp"


@pytest.mark.asyncio
async def test_compress_file_too_large(
    client: AsyncClient, auth_token: str,
):
    """超过 20MB 的文件 → 400"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    large_image = create_large_test_image()
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("huge.jpg", large_image, "image/jpeg"))],
        data={"quality": "80", "output_format": "original"},
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 按目标大小压缩测试
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_compress_target_size_basic(
    client: AsyncClient, auth_token: str,
):
    """大图 + target=50KB → 压缩后文件 < 50KB"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    # 随机噪声图片，JPEG 压缩率低，体积较大
    large_img = create_noisy_image(800, 800)
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("big.jpg", large_img, "image/jpeg"))],
        data={
            "quality": "80",
            "output_format": "original",
            "compress_mode": "target_size",
            "target_size_kb": "50",
        },
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert zf.getinfo(names[0]).file_size <= 50 * 1024


@pytest.mark.asyncio
async def test_compress_target_size_skip_small(
    client: AsyncClient, auth_token: str,
):
    """小图(远小于目标) + target=100KB → 跳过，zip 为空"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    small_img = create_test_image(fmt="JPEG", size=(10, 10), color="blue")
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("tiny.jpg", small_img, "image/jpeg"))],
        data={
            "quality": "80",
            "output_format": "original",
            "compress_mode": "target_size",
            "target_size_kb": "100",
        },
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        assert len(zf.namelist()) == 0


@pytest.mark.asyncio
async def test_compress_target_size_mixed(
    client: AsyncClient, auth_token: str,
):
    """大图+小图 + target=30KB → zip 只含大图"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    big_img = create_noisy_image(600, 600)
    small_img = create_test_image(fmt="JPEG", size=(10, 10), color="blue")
    files = [
        ("files", ("big.jpg", big_img, "image/jpeg")),
        ("files", ("tiny.jpg", small_img, "image/jpeg")),
    ]
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=files,
        data={
            "quality": "80",
            "output_format": "original",
            "compress_mode": "target_size",
            "target_size_kb": "30",
        },
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        names = zf.namelist()
        assert len(names) == 1
        assert names[0] == "big.jpg"


@pytest.mark.asyncio
async def test_compress_target_size_all_skipped(
    client: AsyncClient, auth_token: str,
):
    """所有图片都小于目标 → zip 为空"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    small_img = create_test_image(fmt="JPEG", size=(5, 5), color="green")
    files = [
        ("files", ("a.jpg", small_img, "image/jpeg")),
        ("files", ("b.jpg", small_img, "image/jpeg")),
    ]
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=files,
        data={
            "quality": "80",
            "output_format": "original",
            "compress_mode": "target_size",
            "target_size_kb": "100",
        },
    )
    assert resp.status_code == 200

    zip_buf = io.BytesIO(resp.content)
    with zipfile.ZipFile(zip_buf) as zf:
        assert len(zf.namelist()) == 0


@pytest.mark.asyncio
async def test_compress_invalid_mode(
    client: AsyncClient, auth_token: str, jpeg_bytes: bytes,
):
    """compress_mode 无效值 → 400"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = await client.post(
        COMPRESS_URL,
        headers=headers,
        files=[("files", ("test.jpg", jpeg_bytes, "image/jpeg"))],
        data={
            "quality": "80",
            "output_format": "original",
            "compress_mode": "invalid",
        },
    )
    assert resp.status_code == 400
