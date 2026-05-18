from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


BLOG_CATEGORIES = ["Tech", "Emotion", "Diary", "Question"]


class Blog(SQLModel, table=True):
    """博客模型"""
    __tablename__ = "blogs"

    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id", index=True)
    title: str
    subtitle: Optional[str] = None
    content: str
    category: str = Field(default="Diary")  # 分类
    is_deleted: bool = Field(default=False, index=True)  # 软删除标记
    deleted_at: Optional[datetime] = Field(default=None)  # 删除时间
    view_count: int = Field(default=0)  # 阅读量
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
