# SuperCenter 后端开发规范

> 本规范基于 `sc-backend` 项目实际代码结构整理，用于指导后端开发工作。

---

## 1. 项目概述

### 1.1 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | FastAPI | ASGI Web 框架 |
| ORM | SQLModel | Pydantic + SQLAlchemy 融合 |
| 数据库 | SQLite | 开发阶段；生产可切换 PostgreSQL |
| 认证 | JWT (python-jose) | Token 认证 |
| 密码哈希 | argon2-cffi | 安全密码哈希 |
| 包管理 | uv | 项目依赖管理 |
| API 文档 | /docs | FastAPI 自动生成 |

### 1.2 项目结构

```
sc-backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # Settings 配置类
│   ├── database.py          # 数据库引擎
│   ├── models/              # SQLModel 数据模型
│   │   ├── user.py
│   │   └── blog.py
│   ├── schemas/             # Pydantic 请求/响应模型
│   │   ├── user.py
│   │   └── blog.py
│   ├── routers/             # API 路由
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── blogs.py
│   │   └── upload.py
│   └── middleware/
│       └── auth.py          # JWT 认证中间件
├── tests/                   # 测试目录（TDD）
├── data/                    # SQLite 数据库文件目录
├── public/                  # 静态文件
└── pyproject.toml           # 项目依赖
```

---

## 2. 代码规范

### 2.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块 | 小写下划线 | `user.py`, `blog_cache.py` |
| 类名 | 大驼峰 | `User`, `BlogResponse` |
| 函数名 | 小写下划线 | `get_current_user`, `create_blog` |
| 常量 | 大写下划线 | `MAX_AVATAR_SIZE`, `BLOG_CATEGORIES` |
| 路由变量 | 小写下划线 | `blog_id`, `author_id` |

### 2.2 导入规范

```python
# 标准库
from datetime import datetime
from typing import Optional, List
from enum import Enum

# 第三方库（按字母顺序）
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

# 本地导入（按相对路径从近到远）
from app.database import engine
from app.models import User, Blog
from app.schemas import BlogCreate, BlogResponse
from app.middleware.auth import get_current_user, require_blogger
```

### 2.3 注释规范

```python
class User(SQLModel, table=True):
    """用户模型"""
    ...

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT Token"""
    ...
```

---

## 3. 数据模型规范

### 3.1 模型定义

- 使用 `SQLModel` 定义模型，继承 `SQLModel, table=True`
- 表名使用小写下划线 `__tablename__ = "users"`
- 主键使用 `id: Optional[int] = Field(default=None, primary_key=True)`
- 外键使用 `Field(foreign_key="users.id")`
- 时间字段使用 `Field(default_factory=datetime.utcnow)`

### 3.2 字段类型

| 字段类型 | 写法 | 说明 |
|----------|------|------|
| 主键 | `id: Optional[int] = Field(default=None, primary_key=True)` | 自增主键 |
| 外键 | `author_id: int = Field(foreign_key="users.id")` | 外键关联 |
| 可选字符串 | `avatar_url: Optional[str] = Field(default=None)` | 可空字段 |
| 枚举 | `role: str = Field(default=UserRole.USER.value)` | 使用 Enum |
| 布尔标记 | `is_deleted: bool = Field(default=False)` | 软删除标记 |

### 3.3 软删除规范

- 所有需要删除的实体必须使用软删除机制
- 使用 `is_deleted: bool = Field(default=False)` 标记
- 删除时设置 `deleted_at: datetime = Field(default=None)` 为当前时间
- 查询时必须过滤 `.where(Model.is_deleted == False)`

---

## 4. Schema 规范

### 4.1 命名约定

| Schema 类型 | 命名 | 用途 |
|-------------|------|------|
| 创建请求 | `XxxCreate` | POST 请求体验证 |
| 更新请求 | `XxxUpdate` | PUT/PATCH 请求体验证 |
| 响应 | `XxxResponse` | 返回给客户端的数据 |
| 列表项 | `XxxListResponse` | 列表中的单条数据 |
| Token | `Token` | 认证 Token 响应 |

### 4.2 Schema 定义

```python
class BlogBase(BaseModel):
    """基础 schema"""
    title: str
    content: str

class BlogCreate(BlogBase):
    """创建博客"""
    subtitle: Optional[str] = None
    category: str = Field(default="Diary")

class BlogUpdate(BaseModel):
    """更新博客（字段均为可选）"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class BlogResponse(BlogBase):
    """博客响应"""
    id: int
    author_id: int
    subtitle: Optional[str] = None
    category: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 4.3 字段验证

```python
from pydantic import Field, field_validator
import re

class UserCreate(BaseModel):
    username: str = Field(..., min_length=5, max_length=16)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """验证用户名：只能包含数字、字母、下划线"""
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("用户名只能包含字母、数字和下划线")
        return v
```

---

## 5. 路由规范

### 5.1 路由定义

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/blogs", tags=["博客"])
```

### 5.2 路由命名

| 操作 | 方法 | 路由 | 函数命名 |
|------|------|------|----------|
| 列表 | GET | `/blogs` | `list_blogs` |
| 创建 | POST | `/blogs` | `create_blog` |
| 详情 | GET | `/blogs/{blog_id}` | `get_blog` |
| 更新 | PUT | `/blogs/{blog_id}` | `update_blog` |
| 删除 | DELETE | `/blogs/{blog_id}` | `delete_blog` |

### 5.3 认证依赖注入

```python
# 登录用户可访问
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# 仅博主可访问
@router.post("", response_model=BlogResponse)
def create_blog(
    data: BlogCreate,
    current_user: User = Depends(require_blogger),
):
    ...
```

### 5.4 错误处理

```python
from fastapi import HTTPException, status

# 404 错误
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="博客不存在",
)

# 403 权限错误
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="只能编辑自己的博客",
)

# 401 认证错误
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="无效的认证凭据",
    headers={"WWW-Authenticate": "Bearer"},
)
```

### 5.5 分页参数

```python
from fastapi import Query

@router.get("", response_model=List[BlogListResponse])
def list_blogs(
    skip: int = Query(0, ge=0),       # 偏移量，默认 0
    limit: int = Query(20, ge=1, le=100),  # 限制，默认 20，最大 100
):
    ...
```

---

## 6. 业务逻辑规范

### 6.1 数据库会话管理

使用 FastAPI 依赖注入模式（`get_db`），不在路由函数中手动创建 Session：

```python
from fastapi import Depends
from sqlmodel import Session
from app.database import get_db

# 路由函数通过 Depends 注入 db
@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.get(Blog, blog_id)
    # ... 业务逻辑
    db.commit()
    db.refresh(blog)
    return blog
```

> ⚠️ 不要使用 `with Session(engine) as session:` 的旧写法，统一用 `Depends(get_db)` 注入。

### 6.2 权限检查

```python
# 检查资源归属
blog = db.get(Blog, blog_id)
if blog.author_id != current_user.id:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="只能编辑自己的博客",
    )
```

### 6.3 软删除操作

```python
# 删除时设置标记
blog.is_deleted = True
blog.deleted_at = datetime.utcnow()
db.add(blog)
db.commit()

# 查询时过滤已删除
blogs = db.exec(
    select(Blog).where(Blog.is_deleted == False)
).all()
```

---

## 7. 中间件规范

### 7.1 请求日志

每个请求自动记录 method、path、status_code、耗时(ms)，在 `main.py` 中通过 `@app.middleware("http")` 实现。

### 7.2 全局异常处理

`main.py` 中注册了 `@app.exception_handler(Exception)`，未捕获的异常统一返回：
```json
{"detail": "服务器内部错误，请稍后重试"}
```
错误日志记录到 `supercenter` logger。

### 7.3 响应压缩

启用 `GZipMiddleware`，超过 1000 字节的响应自动 gzip 压缩。

---

## 8. 配置规范

### 7.1 Settings 类

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "SuperCenter API"
    debug: bool = True
    database_url: str = "sqlite:///./data/supercenter.db"
    secret_key: str  # 必填，通过 .env 或环境变量设置
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 天
    upload_dir: str = "public/uploads"
    maxAvatarSize: int = 2 * 1024 * 1024  # 2MB

    class Config:
        env_file = ".env"

settings = Settings()
```

### 7.2 敏感配置

- `secret_key` 等敏感配置必须通过环境变量 `.env` 注入
- 禁止在代码中硬编码敏感信息

---

## 8. API 设计规范

### 8.1 RESTful 风格

| 操作 | 方法 | 路由 | 说明 |
|------|------|------|------|
| 列表 | GET | `/api/blogs` | 获取博客列表 |
| 创建 | POST | `/api/blogs` | 创建博客 |
| 详情 | GET | `/api/blogs/{id}` | 获取博客详情 |
| 更新 | PUT | `/api/blogs/{id}` | 更新博客 |
| 删除 | DELETE | `/api/blogs/{id}` | 删除博客（软删除） |

### 8.2 响应格式

```python
# 成功响应
return blog  # 直接返回模型对象，FastAPI 自动序列化

# 带消息的响应
return {"message": "博客已删除"}

# 列表响应
return result_list  # 返回 List[Schema]
```

---

## 9. 中间件规范

### 9.1 JWT Token 创建

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
```

### 9.2 Token 验证

```python
def verify_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None
```

### 9.3 依赖注入函数

```python
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """获取当前登录用户"""
    ...

def require_blogger(current_user: User = Depends(get_current_user)) -> User:
    """要求是博主角色"""
    if current_user.role != "blogger":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="需要博主权限")
    return current_user
```

---

## 10. 数据库规范

### 10.1 数据库文件

- 统一存放在 `sc-backend/data/` 目录
- 所有 `.db` 文件已加入 `.gitignore`

### 10.2 迁移脚本

> 暂无数据库迁移脚本需求，如有需要按以下方式添加：
> ```bash
> python -m scripts.migrate_add_xxx
> ```

### 10.3 初始化

- 后端启动时通过 `lifespan` 自动创建数据库和表
- 使用 `python -m scripts.seed_db` 创建预置账号

### 10.4 索引策略

为高频查询字段添加索引，通过 SQLModel 的 `Field(index=True)` 声明：

| 表 | 字段 | 用途 |
|----|------|------|
| blogs | `author_id` | 按作者查询 |
| blogs | `is_deleted` | 列表过滤已删除 |
| blogs | `created_at` | 排序 |

> ⚠️ 现有数据库添加索引需要重建表，删除 `data/*.db` 后重启服务即可。

---

## 11. 角色权限

| 角色 | 值 | 权限说明 |
|------|-----|----------|
| `user` | 普通用户 | 修改个人信息 |
| `blogger` | 博主 | 发布/管理博客 |
| `admin` | 管理员 | 功能待定 |

---

## 12. 常用命令

```bash
cd sc-backend

# 安装依赖
uv sync

# 启动开发服务器
uv run uvicorn app.main:app --reload --port 8000
uv run sc.py

# 运行测试（TDD）
uv run pytest

# 创建预置账号（如有 seed_db 脚本）
python -m scripts.seed_db
```

---

## 13. 附录

### 13.1 预置账号

部署后通过种子脚本创建初始账号：

```bash
python -m scripts.seed_db
```

> ⚠️ 请自行设置用户名和密码，不要使用默认值

### 13.2 API 访问

- API 地址：http://localhost:8000/api
- 健康检查：http://localhost:8000/api/health
- API 文档：http://localhost:8000/docs
