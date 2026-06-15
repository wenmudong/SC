import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础 schema"""
    username: str = Field(..., min_length=5, max_length=16)
    email: EmailStr


class UserCreate(UserBase):
    """注册请求"""
    password: str = Field(..., min_length=6, max_length=16)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """验证用户名：只能包含数字、字母、下划线"""
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("用户名只能包含字母、数字和下划线")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码长度"""
        if len(v) < 6 or len(v) > 16:
            raise ValueError("密码长度必须在6-16位之间")
        return v


class UserLogin(BaseModel):
    """登录请求"""
    username: str
    password: str


class UserUpdate(BaseModel):
    """更新个人信息"""
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = None


class UserResponse(UserBase):
    """用户响应"""
    id: int
    avatar_url: Optional[str] = None
    language: str = "en"
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token 载荷数据"""
    user_id: Optional[int] = None
