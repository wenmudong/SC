# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 相关文档

- 项目总览：`docs/SPEC.md`
- 后端开发规范：`docs/BACKEND_DEV.md` — 后端开发规范（含代码规范、模型规范、路由规范等）
- 前端开发规范：`docs/FRONTEND_DEV.md` — 前端开发规范（含 Next.js App Router、TypeScript、Tailwind CSS 等）
- 后端开发规则：`sc-backend/CLAUDE.md`（后端开发规范 + TDD 流程）
- 前端开发规则：`sc-frontend/CLAUDE.md`（Next.js App Router 说明）

## 工作规范

1. **全部使用中文回复**
2. **每次回复以「wenmudong」开头**
3. **每次回答完以 "喵~" 结尾**
4. **任务流程**：明确目标 → 建立计划 → 完善计划 → 保存到 `docs/plans/{yyyymmdd}_{计划名}.md` → 获得批准 → 执行 → 检验是否执行完整
5. **不写兼容性代码**，仅支持目标平台
6. **写代码前先描述方案**，获得批准后再动手；方案需包含改动范围和文件清单，方案必须要图、文、表结合，逻辑、结构清晰
7. **方案制定后需要保存**，方案描述后，询问通过后进行保存
8. **需求模糊时**，先提问澄清后再写代码
9. **修改涉及多个模块或影响范围较广时**，先拆成小任务，每任务有明确交付物
10. **出bug时**，先写最小化可重现步骤，锁定问题后再修复
11. **每次纠正后反思**，记录错误模式和预防措施
12. **代码注释**：代码添加中文注释，关键逻辑说明"为什么这样做"
13. **架构变更后**优先更新 `docs/SPEC.md` 和 `CLAUDE.md`
14. **git commit 前**：代码可运行 + 文档已同步 + 无调试代码
15. **每次 task 完成后**，检查是否需要更新相关文档

## 项目概述

SuperCenter 个人网站，前后端分离架构。

- **后端**：`sc-backend/` — FastAPI + SQLModel + SQLite
- **前端**：`sc-frontend/` — Next.js (App Router) + TypeScript + Tailwind CSS
- **文档**：`docs/SPEC.md` — 项目总览（中文为第一语言）

## 常用命令

### 后端

```bash
cd sc-backend
uv sync                  # 安装/更新依赖
uv run uvicorn app.main:app --reload --port 8000   # 启动开发服务器
uv run pytest           # 运行测试（TDD）
```

### 前端

```bash
cd sc-frontend
npm install              # 安装依赖
npm run dev              # 启动开发服务器 (http://localhost:3000)
npm run build            # 生产构建
```

## 架构要点

### 前端：Next.js App Router

- **页面路由**：`src/app/` 目录结构映射 URL 路径
- **Server Component**（默认）：服务端渲染，可直接访问数据库
- **Client Component**：需添加 `"use client"` 指令才能使用 hooks 和交互
- **组件开发**：`src/components/` 存放全局组件；业务组件按 `features/` 目录组织

### 后端：FastAPI + SQLModel

- **入口**：`app/main.py` — lifespan 管理（启动创建数据库表）、路由挂载、CORS 配置
- **配置**：`app/config.py` — `Settings` 类从 `.env` 读取
- **数据库**：`app/database.py` — 引擎创建，`data/` 目录存放 `.db` 文件
- **路由**：`app/routers/` — 各模块路由定义
- **模型**：`app/models/` — SQLModel 模型定义数据库表结构
- **测试**：`tests/` — TDD 测试目录

### 前后端通信

- 后端：CORS 已配置允许 `localhost:3000`
- 前端调用后端：`http://localhost:8000/api/*`
- 健康检查：`GET http://localhost:8000/api/health`

## 开发约定

- **文档语言**：中文为第一语言，英文仅用于代码注释和技术术语
- **数据库文件**：统一存放在 `sc-backend/data/` 目录，已在 `.gitignore` 中忽略
- **API 规范**：RESTful 风格
- **后端初始化**：启动时自动调用 `create_db_and_tables()` 创建表
- **软删除**：所有的删除需要询问是否使用软删除机制（is_deleted 标记），使用则不会真正从数据库删除
