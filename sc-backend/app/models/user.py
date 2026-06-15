from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    BLOGGER = "blogger"  # 博主：发布/管理博客
    USER = "user"        # 普通用户：修改个人信息
    ADMIN = "admin"      # 管理员：功能待定


class UserLanguage(str, Enum):
    EN = "en"  # 英文
    ZH = "zh"  # 中文


class User(SQLModel, table=True):
    """用户模型"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    avatar_url: Optional[str] = Field(default=None)
    language: str = Field(default=UserLanguage.EN.value)
    role: str = Field(default=UserRole.USER.value)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
