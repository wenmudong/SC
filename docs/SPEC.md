# SuperCenter 技术方案

> **文档语言**：本文档以中文为第一语言，英文仅用于代码注释和技术术语。

## 项目概述

个人网站，前后端分离架构。

## 技术栈

### 后端

| 项 | 技术 | 说明 |
|---|------|------|
| 框架 | FastAPI | ASGI，高性能 |
| 工具 | uv | 包管理与项目工具 |
| ORM | SQLModel | Pydantic + SQLAlchemy |
| 数据库 | SQLite | 开发阶段；生产可切换 PostgreSQL |
| 验证 | Pydantic + JWT | 请求/响应数据校验、Token 认证 |
| 密码哈希 | argon2-cffi | 安全密码哈希 |

### 前端

| 项 | 技术 | 说明 |
|---|------|------|
| 框架 | Next.js (App Router) | React 18，SSR/SSG |
| UI | Tailwind CSS | 原子化 CSS |
| 语言 | TypeScript | 类型安全 |
| 包管理 | npm | |
| MD 编辑器 | @uiw/react-md-editor | Markdown 编辑器 |

### 部署（预留）

- 前端：Vercel / Cloudflare Pages
- 后端：Railway / Fly.io / VPS

## 用户系统

### 角色权限

| 角色 | 说明 | 权限 |
|------|------|------|
| `blogger` | 博主 | 发布/管理博客、个人信息管理 |
| `user` | 普通用户 | 修改个人信息 |
| `admin` | 管理员 | 功能待定 |

### 预置账号

部署后通过种子脚本创建初始账号：

```bash
python -m scripts.seed_db
```

> ⚠️ 请自行设置用户名和密码，不要使用默认值

## 项目结构

```
SuperCenter/
├── docs/
│   ├── SPEC.md              # 项目总览文档
│   ├── commands.md          # 启动命令汇总
│   ├── frontend-structure.md # 前端结构与样式
│   └── plans/               # 实施计划
├── sc-backend/               # 后端服务
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── config.py        # 配置管理
│   │   ├── database.py      # 数据库引擎
│   │   ├── models/          # 数据模型
│   │   │   ├── user.py       # 用户模型
│   │   │   ├── blog.py       # 博客模型（含软删除）
│   │   │   └── system.py     # 系统配置模型
│   │   ├── routers/          # API 路由
│   │   │   ├── auth.py       # 认证路由
│   │   │   ├── users.py      # 用户路由
│   │   │   ├── blogs.py      # 博客路由
│   │   │   ├── upload.py     # 上传路由
│   │   │   ├── admin.py      # 管理路由
│   │   │   └── config.py     # 公开配置路由（无需认证）
│   │   ├── schemas/          # Pydantic Schemas
│   │   └── middleware/       # 中间件
│   │       └── auth.py       # JWT 认证中间件
│   ├── alembic/             # 数据库迁移（Alembic）
│   │   ├── env.py           # 迁移环境配置
│   │   └── versions/        # 迁移版本文件
│   ├── tests/               # 测试目录（TDD）
│   ├── data/                 # 数据库文件目录
│   └── pyproject.toml
└── sc-frontend/              # 前端应用
    ├── src/
    │   ├── app/              # Next.js App Router
    │   │   ├── page.tsx      # 首页 (/)
    │   │   ├── layout.tsx    # 根布局
    │   │   ├── globals.css   # 全局样式
    │   │   ├── auth/
    │   │   │   ├── login/    # 登录页 (/auth/login)
    │   │   │   └── register/ # 注册页 (/auth/register)
    │   │   ├── profile/      # 个人中心 (/profile)
    │   │   ├── blogs/
    │   │   │   ├── page.tsx          # 博客列表 (/blogs)
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx      # 创建博客 (/blogs/new)
    │   │   │   └── [id]/
    │   │   │       └── page.tsx      # 博客详情 (/blogs/[id])
    │   │   ├── projects/     # Projects 页
    │   │   ├── hobbies/      # Hobbies 页
    │   │   └── tools/        # Tools 页
    │   ├── components/
    │   │   ├── Navbar.tsx           # 导航栏
    │   │   ├── FloatingAvatar.tsx   # 左下角悬浮头像（呼吸动画、右键菜单）
    │   │   ├── PageHeader.tsx       # 页面标题
    │   │   ├── Card.tsx            # 项目卡片
    │   │   ├── EmptyState.tsx      # 空状态组件（彩虹渐变）
    │   │   ├── Toast.tsx           # 提示组件（成功/错误/信息）
    │   │   ├── ConfirmDialog.tsx   # 确认弹窗组件
    │   │   └── Providers.tsx        # 全局 Provider 组合
    │   ├── contexts/
    │   │   └── AuthContext.tsx     # 认证状态管理
    │   ├── services/
    │   │   └── api.ts              # API 服务层
    │   └── types/
    │       └── index.ts             # TypeScript 类型定义
    ├── public/
    │   ├── uploads/avatars/          # 头像上传目录
    │   └── fonts/                   # 字体文件
    └── package.json
```

## 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| username | str | 用户名（唯一，5-16位字母/数字/下划线） |
| email | str | 邮箱（唯一） |
| password_hash | str | Argon2 哈希密码 |
| avatar_url | str | 头像 URL（base64 data URL） |
| role | str | 角色：blogger/user/admin |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### Blog（博客）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| author_id | int | 作者 ID（外键） |
| title | str | 标题 |
| subtitle | str | 副标题（可选） |
| content | str | 内容（Markdown 格式） |
| is_deleted | bool | 软删除标记（默认 False） |
| deleted_at | datetime | 删除时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## API 路由

### 认证 API

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |

### 用户 API

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/users/me | 获取个人信息 | 是 |
| PATCH | /api/users/me | 更新个人信息 | 是 |

### 上传 API

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/upload/avatar | 上传头像（base64 存储） | 是 |

### 博客 API

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/blogs | 获取博客列表（排除已删除） | 否 |
| POST | /api/blogs | 创建博客 | 是 (blogger) |
| GET | /api/blogs/{id} | 获取博客详情 | 否 |
| PUT | /api/blogs/{id} | 更新博客 | 是 (blogger) |
| DELETE | /api/blogs/{id} | 软删除博客 | 是 (blogger) |

### 公开配置 API

| 方法 | 路由 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/config | 获取公开的系统配置（全局生效的配置） | 否 |

> 说明：公开配置用于所有用户都需要的配置项（如全局字体），无需认证即可访问。管理员通过 `/api/admin/config` 设置配置后，普通用户通过此接口获取。

## 启动方式

### 后端

```bash
cd sc-backend
.venv\Scripts\activate
uv sync
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd sc-frontend
npm install
npm run dev
```

## 数据库

- 数据库文件统一存放在 `sc-backend/data/` 目录下
- 支持多数据库：可在 `data/` 目录添加新的 `.db` 文件
- **数据库迁移使用 Alembic**：修改模型后必须生成迁移脚本
- 所有 `.db` 文件已被 `.gitignore` 忽略，不会提交到版本控制
- 软删除：博客使用软删除机制，删除时设置 `is_deleted=True`，不会真正从数据库删除

## 开发约定

- API 遵循 RESTful 规范
- 前端通过 `/api` 前缀调用后端接口（已配置 CORS 允许 localhost:3000）
- **数据库迁移使用 Alembic**：修改模型后必须生成迁移脚本
- 文档随项目更新同步维护
- 各子项目详细文档：
  - 后端详细文档：`sc-backend/CLAUDE.md`
  - 前端详细文档：`sc-frontend/README.md`
  - 前端结构与样式：`docs/frontend-structure.md`
