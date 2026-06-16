"""公开配置 API 测试"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_public_configs(client: AsyncClient):
    """测试获取公开配置（无需认证）"""
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert "configs" in data
    assert isinstance(data["configs"], dict)


@pytest.mark.asyncio
async def test_get_public_configs_no_auth_required(client: AsyncClient):
    """测试无需认证即可访问"""
    # 不传递任何认证信息
    response = await client.get("/api/config")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_public_configs_returns_only_public_keys(client: AsyncClient):
    """测试只返回公开的配置键"""
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()

    # 检查返回的键是否都在 PUBLIC_CONFIG_KEYS 中
    from app.routers.config import PUBLIC_CONFIG_KEYS
    for key in data["configs"]:
        assert key in PUBLIC_CONFIG_KEYS
