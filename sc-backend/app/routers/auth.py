"""认证路由"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from passlib.hash import argon2
from sqlmodel import Session, select

logger = logging.getLogger("supercenter.auth")

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.middleware.auth import create_access_token, get_current_user
from app.middleware.rate_limit import rate_limit_login

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否存在
    existing = db.exec(
        select(User).where(User.username == data.username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )

    # 检查邮箱是否存在
    existing_email = db.exec(
        select(User).where(User.email == data.email)
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册",
        )

    # 创建用户
    user = User(
        username=data.username,
        email=data.email,
        password_hash=argon2.hash(data.password),
        role="user",  # 默认角色
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 生成 Token
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """用户登录"""
    # 速率限制
    rate_limit_login(request)

    # 获取客户端信息
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "unknown")

    user = db.exec(
        select(User).where(User.username == data.username)
    ).first()

    if not user or not argon2.verify(data.password, user.password_hash):
        # 记录登录失败
        logger.warning(
            f"登录失败: username={data.username}, "
            f"ip={client_ip}, user_agent={user_agent}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    # 记录登录成功
    logger.info(
        f"登录成功: user_id={user.id}, username={user.username}, "
        f"ip={client_ip}, user_agent={user_agent}"
    )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user
