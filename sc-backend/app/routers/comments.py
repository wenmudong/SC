"""评论路由"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_db
from app.models import User, Blog, Comment
from app.schemas import CommentCreate, CommentUpdate, CommentResponse, CommentTreeResponse
from app.middleware.auth import get_current_user, require_blogger

router = APIRouter(prefix="/api/blogs", tags=["评论"])


def build_comment_tree(comments: List[Comment], users_cache: dict) -> List[CommentTreeResponse]:
    """构建评论树"""
    comment_map = {}
    roots = []

    # 创建评论映射
    for comment in comments:
        comment_map[comment.id] = CommentTreeResponse(
            id=comment.id,
            blog_id=comment.blog_id,
            author_id=comment.author_id,
            author_username=users_cache.get(comment.author_id, {}).get("username", "Unknown"),
            author_avatar=users_cache.get(comment.author_id, {}).get("avatar_url"),
            parent_id=comment.parent_id,
            depth=comment.depth,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            replies=[],
        )

    # 构建树结构
    for comment in comments:
        if comment.parent_id is None:
            roots.append(comment_map[comment.id])
        else:
            parent = comment_map.get(comment.parent_id)
            if parent:
                parent.replies.append(comment_map[comment.id])

    return roots


@router.get("/{blog_id}/comments", response_model=List[CommentTreeResponse])
def list_comments(blog_id: int, db: Session = Depends(get_db)):
    """获取博客的所有评论（树形结构）"""
    # 检查博客是否存在
    blog = db.get(Blog, blog_id)
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在",
        )

    # 获取所有评论（排除已删除）
    comments = db.exec(
        select(Comment)
        .where(Comment.blog_id == blog_id, Comment.is_deleted == False)
        .order_by(Comment.created_at)
    ).all()

    if not comments:
        return []

    # 获取所有评论作者信息
    author_ids = set(c.author_id for c in comments)
    users = db.exec(
        select(User).where(User.id.in_(author_ids))
    ).all()
    users_cache = {u.id: {"username": u.username, "avatar_url": u.avatar_url} for u in users}

    return build_comment_tree(comments, users_cache)


@router.post("/{blog_id}/comments", response_model=CommentResponse)
def create_comment(
    blog_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """发布评论（需登录）"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请先登录",
        )

    # 检查博客是否存在
    blog = db.get(Blog, blog_id)
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在",
        )

    # 计算评论深度（限制最大嵌套深度为 3）
    depth = 0
    actual_parent_id = data.parent_id
    if data.parent_id:
        parent = db.get(Comment, data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="父评论不存在",
            )
        if parent.depth >= 3:
            # 超过最大深度，作为顶级评论
            actual_parent_id = None
        else:
            depth = parent.depth + 1

    comment = Comment(
        blog_id=blog_id,
        author_id=current_user.id,
        parent_id=actual_parent_id,
        content=data.content,
        depth=depth,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        blog_id=comment.blog_id,
        author_id=comment.author_id,
        author_username=current_user.username,
        author_avatar=current_user.avatar_url,
        parent_id=comment.parent_id,
        depth=comment.depth,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete("/{blog_id}/comments/{comment_id}")
def delete_comment(
    blog_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除评论（博主或评论者本人）- 软删除"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请先登录",
        )

    comment = db.get(Comment, comment_id)
    if not comment or comment.blog_id != blog_id or comment.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评论不存在",
        )

    # 博主可以删除任何评论，普通用户只能删除自己的
    if current_user.role != "blogger" and comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除此评论",
        )

    # 软删除
    from datetime import datetime
    comment.is_deleted = True
    comment.deleted_at = datetime.utcnow()
    db.add(comment)
    db.commit()
    return {"message": "评论已删除"}


@router.post("/{blog_id}/comments/{comment_id}/replies", response_model=CommentResponse)
def reply_comment(
    blog_id: int,
    comment_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
):
    """回复评论（快捷方式）"""
    data.parent_id = comment_id
    return create_comment(blog_id, data, current_user)
