"""
测试辅助函数
"""
from httpx import AsyncClient


async def get_json(client: AsyncClient, url: str, status_code: int = 200):
    """发送 GET 请求并验证状态码"""
    response = await client.get(url)
    assert response.status_code == status_code
    return response.json()


async def post_json(client: AsyncClient, url: str, json: dict, status_code: int = 200):
    """发送 POST 请求并验证状态码"""
    response = await client.post(url, json=json)
    assert response.status_code == status_code
    return response.json()
