# 后端优化方案

## Context

后端代码结构检查后发现以下问题需要优化：
1. Comment 模型缺少软删除机制（Blog 有 `is_deleted`，Comment 没有）
2. 评论嵌套深度无限制，可能导致前端无法处理
3. `app/user.jpg` 测试文件误放在 app 目录
4. 未使用的 `get_current_user_optional` 函数
5. `blogs.py` 中 `datetime` 导入位置不规范（在函数内部）

---

## 改动范围

### 1. Comment 添加软删除支持
- **文件**: `sc-backend/app/models/comment.py`
- **改动**: 添加 `is_deleted: bool` 和 `deleted_at: Optional[datetime]` 字段
- **文件**: `sc-backend/app/schemas/comment.py`
- **改动**: CommentResponse 和 CommentTreeResponse 添加 `is_deleted` 字段
- **文件**: `sc-backend/app/routers/comments.py`
- **改动**:
  - `list_comments`: 排除已删除评论
  - `delete_comment`: 改为软删除

### 2. 评论嵌套深度限制
- **文件**: `sc-backend/app/routers/comments.py`
- **改动**: 在 `create_comment` 中限制 `max_depth=3`，超过则作为顶级评论

### 3. 删除测试文件
- **文件**: `sc-backend/app/user.jpg`
- **操作**: 删除此文件

### 4. 清理未使用代码
- **文件**: `sc-backend/app/middleware/auth.py`
- **操作**: 删除未使用的 `get_current_user_optional` 函数

### 5. 规范导入
- **文件**: `sc-backend/app/routers/blogs.py`
- **改动**: 将 `from datetime import datetime` 移到文件顶部

### 6. 添加评论软删除迁移脚本
- **文件**: `sc-backend/scripts/migrate_comment_soft_delete.py`
- **操作**: 创建迁移脚本，为 comments 表添加 `is_deleted` 和 `deleted_at` 列

---

## 文件清单

| 文件 | 操作 |
|------|------|
| `sc-backend/app/user.jpg` | 删除 |
| `sc-backend/app/models/comment.py` | 修改 |
| `sc-backend/app/schemas/comment.py` | 修改 |
| `sc-backend/app/routers/comments.py` | 修改 |
| `sc-backend/app/middleware/auth.py` | 修改 |
| `sc-backend/app/routers/blogs.py` | 修改 |
| `sc-backend/scripts/migrate_comment_soft_delete.py` | 新增 |

---

## 验证方式

1. 启动后端服务: `uvicorn app.main:app --reload --port 8000`
2. 访问 API 文档: http://localhost:8000/docs
3. 测试评论软删除: 创建评论 → 删除评论 → 再次获取评论列表验证已被过滤
4. 测试嵌套深度: 创建深度为 3 的回复 → 尝试创建深度为 4 的回复，验证超过限制后作为顶级评论
