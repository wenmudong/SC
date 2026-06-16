import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel, Session, create_engine
from app.main import app
from app import database

# 测试数据库路径
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "test_sc.db")
TEST_DATABASE_URL = f"sqlite:///{os.path.abspath(TEST_DB_PATH)}"

# 创建测试引擎（独立于开发数据库）
_engine = create_engine(TEST_DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


@pytest_asyncio.fixture(autouse=True)
def setup_test_db():
    """每个测试前重建表，测试后清理"""
    SQLModel.metadata.create_all(_engine)
    yield
    SQLModel.metadata.drop_all(_engine)


@pytest_asyncio.fixture
async def client():
    """异步测试客户端（覆盖数据库依赖）"""
    # 覆盖 get_db 使用测试数据库
    def override_get_db():
        db = Session(_engine)
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[database.get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def test_engine():
    """暴露测试引擎供测试使用"""
    return _engine


# 配置 pytest-asyncio
pytest_plugins = ('pytest_asyncio',)
