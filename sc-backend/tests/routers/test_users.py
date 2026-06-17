"""用户路由测试

测试 POST /api/users/change-password 端点
"""
import pytest
from httpx import AsyncClient
from passlib.hash import argon2
from sqlmodel import Session

from app.models import User


def create_test_user(db: Session, username="testuser", password="testpass123"):
    """创建测试用户并返回"""
    user = User(
        username=username,
        email=f"{username}@test.com",
        password_hash=argon2.hash(password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# 测试用例
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_change_password_success(client: AsyncClient, test_engine):
    """修改密码成功"""
    # 创建测试用户
    with Session(test_engine) as db:
        create_test_user(db)

    # 登录获取 token
    login_resp = await client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 修改密码
    response = await client.post(
        "/api/users/change-password",
        json={"old_password": "testpass123", "new_password": "newpass123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "密码修改成功"

    # 验证新密码可以登录
    login_resp2 = await client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "newpass123"},
    )
    assert login_resp2.status_code == 200


@pytest.mark.asyncio
async def test_change_password_wrong_old_password(client: AsyncClient, test_engine):
    """旧密码错误"""
    with Session(test_engine) as db:
        create_test_user(db)

    login_resp = await client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"},
    )
    token = login_resp.json()["access_token"]

    response = await client.post(
        "/api/users/change-password",
        json={"old_password": "wrongpass", "new_password": "newpass123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "旧密码错误"


@pytest.mark.asyncio
async def test_change_password_new_too_short(client: AsyncClient, test_engine):
    """新密码少于6位"""
    with Session(test_engine) as db:
        create_test_user(db)

    login_resp = await client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"},
    )
    token = login_resp.json()["access_token"]

    response = await client.post(
        "/api/users/change-password",
        json={"old_password": "testpass123", "new_password": "12345"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_change_password_no_auth(client: AsyncClient):
    """未登录"""
    response = await client.post(
        "/api/users/change-password",
        json={"old_password": "testpass123", "new_password": "newpass123"},
    )
    assert response.status_code == 401
