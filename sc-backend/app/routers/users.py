"""用户路由"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["用户"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新当前用户信息"""
    user = db.get(User, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    if data.email is not None:
        # 检查邮箱是否被其他用户使用
        existing = db.exec(
            select(User).where(User.email == data.email, User.id != user.id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用",
            )
        user.email = data.email

    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
