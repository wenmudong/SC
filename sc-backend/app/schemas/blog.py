from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

BLOG_CATEGORIES = ["Tech", "Emotion", "Diary", "Question"]


class BlogBase(BaseModel):
    """博客基础 schema"""
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=1)
    category: Literal["Tech", "Emotion", "Diary", "Question"] = "Diary"


class BlogCreate(BlogBase):
    """创建博客请求"""
    pass


class BlogUpdate(BaseModel):
    """更新博客请求"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[Literal["Tech", "Emotion", "Diary", "Question"]] = None


class BlogResponse(BlogBase):
    """博客响应"""
    id: int
    author_id: int
    author_username: str  # 作者用户名
    view_count: int = 0  # 阅读量
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogListResponse(BaseModel):
    """博客列表响应（包含作者信息）"""
    id: int
    title: str
    subtitle: Optional[str] = None
    content: str = ""  # 正文内容，用于列表展示
    author_id: int
    author_username: str
    category: str = "Diary"
    view_count: int = 0  # 阅读量
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
