"""公开配置 API 测试"""
import pytest
from httpx import AsyncClient
from sqlmodel import Session
from app.models.system import SystemConfig
from app.models.user import User
from app.middleware.auth import create_access_token


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


@pytest.mark.asyncio
async def test_get_public_configs_empty_when_no_configs(client: AsyncClient):
    """测试无配置时返回空字典"""
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert data["configs"] == {}


@pytest.mark.asyncio
async def test_get_public_configs_returns_config_value(client: AsyncClient, test_engine):
    """测试返回配置值（模拟管理员设置字体配置后，普通用户获取）"""
    # 模拟管理员设置字体配置
    with Session(test_engine) as db:
        config = SystemConfig(
            key="global_font",
            value="Inter, sans-serif",
            description="全局字体配置"
        )
        db.add(config)
        db.commit()

    # 普通用户获取公开配置
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert "configs" in data
    assert data["configs"]["global_font"] == "Inter, sans-serif"


@pytest.mark.asyncio
async def test_get_public_configs_multiple_keys(client: AsyncClient, test_engine):
    """测试返回多个公开配置键"""
    # 模拟管理员设置多个配置
    with Session(test_engine) as db:
        font_config = SystemConfig(
            key="global_font",
            value="Noto Sans SC, sans-serif",
            description="全局字体配置"
        )
        navbar_config = SystemConfig(
            key="navbar_config",
            value='{"logo": "SuperCenter", "links": []}',
            description="导航栏配置"
        )
        db.add(font_config)
        db.add(navbar_config)
        db.commit()

    # 获取公开配置
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert "configs" in data
    assert data["configs"]["global_font"] == "Noto Sans SC, sans-serif"
    assert "navbar_config" in data["configs"]


@pytest.mark.asyncio
async def test_get_public_configs_does_not_expose_private_keys(client: AsyncClient, test_engine):
    """测试不暴露私有配置键"""
    # 添加非公开配置
    with Session(test_engine) as db:
        private_config = SystemConfig(
            key="secret_api_key",
            value="sk-1234567890",
            description="私有API密钥"
        )
        db.add(private_config)
        db.commit()

    # 获取公开配置
    response = await client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    # 私有键不应出现
    assert "secret_api_key" not in data["configs"]


@pytest.mark.asyncio
async def test_public_config_sync_with_admin_api(client: AsyncClient, test_engine):
    """测试端到端：管理员设置配置 -> 公开API返回"""
    # 创建管理员用户
    with Session(test_engine) as db:
        admin_user = User(
            username="testadmin",
            email="admin@test.com",
            password_hash="hashed_password",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # 生成管理员token
    token = create_access_token(data={"sub": str(admin_user.id)})

    # 管理员通过 admin API 设置字体配置
    admin_response = await client.put(
        "/api/admin/config/global_font",
        json={"value": "Microsoft YaHei, sans-serif"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert admin_response.status_code == 200

    # 普通用户通过公开 API 获取配置
    public_response = await client.get("/api/config")
    assert public_response.status_code == 200
    data = public_response.json()
    assert data["configs"]["global_font"] == "Microsoft YaHei, sans-serif"
