"""速率限制器单元测试"""
import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.middleware.rate_limit import RateLimiter, rate_limit_login, login_limiter


@pytest.fixture(autouse=True)
def reset_limiter():
    """每个测试前重置全局速率限制器状态"""
    login_limiter.requests.clear()
    yield
    login_limiter.requests.clear()


@pytest.fixture
def app():
    """创建测试应用"""
    app = FastAPI()

    @app.post("/test-login")
    def test_login(request: Request):
        rate_limit_login(request)
        return {"message": "success"}

    return app


@pytest.fixture
def client(app):
    """创建测试客户端"""
    return TestClient(app)


def test_normal_request_allowed(client):
    """测试正常请求允许通过"""
    response = client.post("/test-login")
    assert response.status_code == 200
    assert response.json() == {"message": "success"}


def test_rate_limit_exceeded(client):
    """测试超过限制返回 429"""
    # 发送 5 次请求（应该允许）
    for i in range(5):
        response = client.post("/test-login")
        assert response.status_code == 200

    # 第 6 次请求应该被限制
    response = client.post("/test-login")
    assert response.status_code == 429
    assert "登录尝试过于频繁" in response.json()["detail"]


def test_separate_ip_counts():
    """测试多个 IP 独立计数"""
    limiter = RateLimiter(max_requests=2, window_seconds=60)

    # 创建模拟请求
    def make_request(ip: str) -> Request:
        request = MagicMock()
        request.client.host = ip
        request.headers = {}
        return request

    # IP 1 发送 2 次请求
    assert limiter.is_allowed(make_request("1.1.1.1")) == True
    assert limiter.is_allowed(make_request("1.1.1.1")) == True
    assert limiter.is_allowed(make_request("1.1.1.1")) == False  # 超过限制

    # IP 2 仍然可以发送请求
    assert limiter.is_allowed(make_request("2.2.2.2")) == True


def test_window_expiry():
    """测试窗口过期后重置计数"""
    from datetime import datetime, timedelta

    limiter = RateLimiter(max_requests=1, window_seconds=1)

    # 创建模拟请求
    def make_request(ip: str) -> Request:
        request = MagicMock()
        request.client.host = ip
        request.headers = {}
        return request

    # 发送一次请求
    assert limiter.is_allowed(make_request("1.1.1.1")) == True
    assert limiter.is_allowed(make_request("1.1.1.1")) == False  # 超过限制

    # 手动修改时间，模拟窗口过期
    limiter.requests["1.1.1.1"] = [
        datetime.utcnow() - timedelta(seconds=2)
    ]

    # 窗口过期后应该允许新请求
    assert limiter.is_allowed(make_request("1.1.1.1")) == True
