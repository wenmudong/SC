# 用户认证与博客系统实施计划

**创建日期**：2026-04-02
**状态**：已完成 ✅
**负责人**：Claude

---

## 一、需求概述

### 1.1 功能需求

1. **用户系统**：注册、登录、JWT 认证、个人中心
2. **角色权限**：三种角色（blogger/user/admin）
3. **头像**：上传/显示、默认头像
4. **博客系统**：CRUD、列表、详情
5. **评论系统**：两级嵌套评论
6. **UI**：左下角悬浮头像 + 个人中心入口
7. **登录触发**：导航切换或点击操作时触发登录

### 1.2 角色定义

| 角色 | 说明 | 权限 |
|------|------|------|
| `blogger` | 博主（预置账号：wenmudong） | 发布/管理博客、增删改查评论、个人信息管理 |
| `user` | 普通用户 | 评论、修改个人信息 |
| `admin` | 管理员 | 功能待定 |

### 1.3 URL 结构（方案 C：分离结构）

```
# 页面路由
/blogs                    # 博客列表页
/blogs/[id]               # 博客详情页
/blogs/create             # 创建博客页（博主）
/blogs/[id]/edit          # 编辑博客页（博主）
/profile                  # 个人中心页（需登录）
/auth/login               # 登录页
/auth/register             # 注册页

# API 路由
POST   /api/auth/register           # 注册
POST   /api/auth/login              # 登录
GET    /api/auth/me                 # 获取当前用户

GET    /api/users/me                # 获取个人信息
PATCH  /api/users/me                # 更新个人信息
POST   /api/upload/avatar           # 上传头像

GET    /api/blogs                   # 博客列表
POST   /api/blogs                  # 创建博客（博主）
GET    /api/blogs/[id]             # 博客详情
PUT    /api/blogs/[id]              # 更新博客（博主）
DELETE /api/blogs/[id]              # 删除博客（博主）

GET    /api/blogs/[id]/comments     # 评论列表
POST   /api/blogs/[id]/comments     # 发布评论（需登录）
DELETE /api/blogs/[id]/comments/[id] # 删除评论（博主/评论者）
POST   /api/blogs/[id]/comments/[id]/replies # 回复评论（需登录）
```

### 1.4 评论嵌套方案（两级，可继续嵌套）

```
Comment (depth=0, parent_id=null)     ← 顶级评论
├── Reply (depth=1, parent_id=xxx)     ← 二级评论
│   └── Reply (depth=2, parent_id=yyy) ← 三级评论（前端显示在二级下）
├── Reply (depth=1, parent_id=xxx)
└── Reply (depth=1, parent_id=xxx)

# 数据库允许无限嵌套，前端最多显示两级展开
```

---

## 二、技术方案

### 2.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端框架** | FastAPI + SQLModel | 现有 |
| **数据库** | SQLite | 现有 |
| **密码哈希** | argon2-cffi | 比 bcrypt 更安全 |
| **Token** | python-jose (JWT) | HS256 算法 |
| **前端框架** | Next.js 16 (App Router) | 现有 |
| **表单验证** | Zod | 前后端共用 schema |
| **头像存储** | 本地文件系统 `public/uploads/avatars/` | 生产环境可迁移至 S3/COS |

### 2.2 数据库模型

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,      -- 用户名（登录用）
    email TEXT UNIQUE NOT NULL,         -- 邮箱
    password_hash TEXT NOT NULL,         -- Argon2 哈希密码
    avatar_url TEXT,                     -- 头像路径
    role TEXT DEFAULT 'user',            -- blogger / user / admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 博客表
CREATE TABLE blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评论表（自引用支持无限嵌套）
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id),  -- NULL=顶级评论
    content TEXT NOT NULL,
    depth INTEGER DEFAULT 0,                     -- 嵌套深度
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 目录结构

```
sc-backend/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # 用户模型
│   │   ├── blog.py           # 博客模型
│   │   └── comment.py        # 评论模型
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py           # 认证路由
│   │   ├── users.py          # 用户路由
│   │   ├── blogs.py          # 博客路由
│   │   ├── comments.py       # 评论路由
│   │   └── upload.py         # 上传路由
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py           # JWT 验证中间件
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py           # 用户 Pydantic schema
│   │   ├── blog.py           # 博客 Pydantic schema
│   │   └── comment.py        # 评论 Pydantic schema
│   ├── config.py
│   ├── database.py
│   └── main.py
├── data/                      # SQLite 数据库目录
│   └── .gitignore             # 忽略 *.db 文件
└── ...

sc-frontend/
├── public/
│   └── uploads/
│       └── avatars/           # 头像存储目录
│           └── .gitkeep
└── src/
    ├── app/
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── profile/page.tsx
    │   ├── blogs/
    │   │   ├── page.tsx                    # 博客列表
    │   │   ├── new/page.tsx               # 创建博客
    │   │   ├── [id]/page.tsx              # 博客详情
    │   │   └── [id]/edit/page.tsx         # 编辑博客
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── Navbar.tsx
    │   ├── FloatingAvatar.tsx             # 左下角悬浮头像
    │   ├── LoginModal.tsx                 # 登录弹窗
    │   ├── BlogCard.tsx
    │   ├── CommentItem.tsx
    │   └── CommentForm.tsx
    ├── contexts/
    │   └── AuthContext.tsx                # 认证状态管理
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useAuthGuard.ts               # 权限守卫
    ├── services/
    │   └── api.ts
    └── types/
        └── index.ts
```

---

## 三、任务拆分

### 阶段 1：基础设施（后端依赖 + 数据库模型）

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T1.1 | 安装后端依赖 | `pyproject.toml` 更新 | - |
| T1.2 | 创建用户模型 | `app/models/user.py` | T1.1 |
| T1.3 | 创建博客模型 | `app/models/blog.py` | T1.1 |
| T1.4 | 创建评论模型 | `app/models/comment.py` | T1.1 |
| T1.5 | 创建 Pydantic Schemas | `app/schemas/` 目录及文件 | T1.2, T1.3, T1.4 |
| T1.6 | 初始化博主账号 | 数据库种子脚本 | T1.2 |

### 阶段 2：认证系统

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T2.1 | JWT 中间件 | `app/middleware/auth.py` | T1.2 |
| T2.2 | 认证路由 | `app/routers/auth.py` | T2.1 |
| T2.3 | 用户路由 | `app/routers/users.py` | T2.1 |
| T2.4 | 头像上传路由 | `app/routers/upload.py` | T2.1 |

### 阶段 3：前端认证

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T3.1 | Auth Context | `src/contexts/AuthContext.tsx` | T2.2 |
| T3.2 | 登录/注册页面 | `src/app/auth/login/page.tsx`, `register/page.tsx` | T3.1 |
| T3.3 | 个人中心页面 | `src/app/profile/page.tsx` | T3.1 |
| T3.4 | 悬浮头像组件 | `src/components/FloatingAvatar.tsx` | T3.1 |
| T3.5 | 登录弹窗组件 | `src/components/LoginModal.tsx` | T3.1 |
| T3.6 | 权限守卫 Hook | `src/hooks/useAuthGuard.ts` | T3.1 |

### 阶段 4：博客系统

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T4.1 | 博客 CRUD API | `app/routers/blogs.py` | T1.3, T2.1 |
| T4.2 | 博客列表页 | `src/app/blogs/page.tsx` | T4.1 |
| T4.3 | 博客详情页 | `src/app/blogs/[id]/page.tsx` | T4.1 |
| T4.4 | 创建博客页（博主） | `src/app/blogs/new/page.tsx` | T4.1 |
| T4.5 | 编辑博客页（博主） | `src/app/blogs/[id]/edit/page.tsx` | T4.1 |

### 阶段 5：评论系统

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T5.1 | 评论 API | `app/routers/comments.py` | T1.4, T2.1 |
| T5.2 | 评论组件 | `src/components/CommentItem.tsx`, `CommentForm.tsx` | T5.1 |

### 阶段 6：UI 优化与集成

| 任务 ID | 任务名称 | 交付物 | 依赖 |
|---------|----------|--------|------|
| T6.1 | Navbar 权限集成 | 修改 Navbar | T3.4, T3.5 |
| T6.2 | 登录触发逻辑 | LoginModal 集成到 Layout | T3.5 |
| T6.3 | 样式适配 | 像素字体兼容性 | - |

---

## 四、执行顺序

```
阶段 1 ──► 阶段 2 ──► 阶段 3 ──► 阶段 4 ──► 阶段 5 ──► 阶段 6
  │           │           │           │           │          │
  ▼           ▼           ▼           ▼           ▼          ▼
 基础模型    认证后端    前端认证    博客前后端   评论前后端   UI集成
```

---

## 五、待确认事项

1. **博主账号密码**：请提供 `wenmudong` 的密码（用于预置账号）
2. **admin 角色**：是否需要预置 admin 账号？如需要，用户名和密码？
3. **头像默认图**：是否使用默认头像（如 Gravatar 或内置默认图）？

---

## 六、风险与注意事项

1. **JWT Token 存储**：前端使用 localStorage（简单实现），生产环境建议用 HttpOnly Cookie
2. **头像文件清理**：删除用户时需清理头像文件
3. **评论无限嵌套**：数据库允许无限，但前端最多展示两级

---

## 七、后续扩展预留

- admin 功能（如用户管理）
- 博客分类/标签
- 博客草稿功能
- 点赞/收藏
