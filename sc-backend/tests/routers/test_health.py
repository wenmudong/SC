"""
健康检查接口测试（TDD 练手）
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """测试健康检查接口返回正常状态"""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_health_check_response_structure(client: AsyncClient):
    """测试健康检查响应结构"""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    # 验证必要字段
    assert "status" in data
