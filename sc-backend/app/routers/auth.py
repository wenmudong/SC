"""认证路由"""
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.hash import argon2
from sqlmodel import Session, select

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.middleware.auth import create_access_token, get_current_user

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
def login(data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    user = db.exec(
        select(User).where(User.username == data.username)
    ).first()

    if not user or not argon2.verify(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user
