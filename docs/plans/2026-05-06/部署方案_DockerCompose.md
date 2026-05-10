# SuperCenter Docker Compose 部署方案

## Context

SuperCenter 项目当前处于纯开发阶段，没有任何部署配置。用户需要将其部署到已有的云服务器上，采用 Docker Compose 编排（Nginx + 前端 + 后端），通过 80 端口对外提供服务，暂不配置域名和 HTTPS。

## 架构

```
浏览器 → :80 (Nginx)
              ├─ /           → frontend:3000  (Next.js standalone)
              ├─ /api/*      → backend:8000   (FastAPI + uvicorn)
              └─ /uploads/*  → backend:8000   (静态文件)
```

## 文件变更清单

| 序号 | 文件 | 操作 | 说明 |
|------|------|------|------|
| 1 | `sc-backend/app/config.py` | 修改 | 新增 `allowed_origins` 字段，`debug` 默认值改 `False` |
| 2 | `sc-backend/app/main.py` | 修改 | CORS origins 从 settings 读取并 split |
| 3 | `sc-frontend/src/services/api.ts` | 修改 | API_BASE 改为环境变量，默认 `/api` |
| 4 | `sc-frontend/next.config.ts` | 修改 | 添加 `output: "standalone"` |
| 5 | `sc-backend/Dockerfile` | 新建 | Python 3.11 + uv 构建 |
| 6 | `sc-frontend/Dockerfile` | 新建 | 多阶段 Node 20 构建 |
| 7 | `sc-backend/.dockerignore` | 新建 | 排除 venv/tests/cache |
| 8 | `sc-frontend/.dockerignore` | 新建 | 排除 node_modules/.next |
| 9 | `docker-compose.yml` | 新建 | 三服务编排（根目录） |
| 10 | `nginx.conf` | 新建 | 反向代理配置（根目录） |
| 11 | `.env.example` | 新建 | 环境变量模板（根目录） |
| 12 | `docs/DEPLOYMENT.md` | 新建 | 部署文档 |

## 详细改动

### 1. `sc-backend/app/config.py` — 新增 allowed_origins，debug 默认改 False

```python
# 新增字段
allowed_origins: str = "http://localhost:3000"

# 修改 debug 默认值
debug: bool = False  # 原为 True，生产更安全
```

### 2. `sc-backend/app/main.py` — CORS 从 settings 读取

第 29 行 `allow_origins=["http://localhost:3000"]` 改为：
```python
allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
```

### 3. `sc-frontend/src/services/api.ts` — API_BASE 环境变量化

第 4 行改为：
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
```

> 设计决策：Nginx 反向代理架构下，前端用相对路径 `/api` 即可，无需完整 URL。开发环境默认值 `/api` 也兼容（需配合 Nginx 或 Next.js rewrites）。

### 4. `sc-frontend/next.config.ts` — 启用 standalone

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

### 5. `sc-backend/Dockerfile`

- 基于 `python:3.11-slim`
- 通过 `COPY --from=ghcr.io/astral-sh/uv:latest` 安装 uv
- 先复制 `pyproject.toml` + `uv.lock` 利用层缓存
- `uv sync --frozen --no-dev` 安装生产依赖
- CMD: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1`

### 6. `sc-frontend/Dockerfile` — 多阶段构建

- Stage 1 (builder): `node:20-alpine`，npm ci + npm run build
- Stage 2 (runner): `node:20-alpine`，复制 standalone 产物
- 通过 `ARG NEXT_PUBLIC_API_URL=/api` 构建时注入

### 7-8. `.dockerignore` 文件

前后端各一个，排除 `.venv/`、`node_modules/`、`__pycache__/`、`data/`、`.next/`、`tests/` 等。

### 9. `docker-compose.yml`（根目录）

三个服务：
- **nginx**: `nginx:alpine`，映射 80 端口，挂载 nginx.conf
- **frontend**: 构建 sc-frontend，expose 3000
- **backend**: 构建 sc-backend，expose 8000，挂载 `./data` 和 `./uploads` 到宿主机持久化
- 后端环境变量：`DEBUG=false`、`SECRET_KEY`、`ALLOWED_ORIGINS` 从 `.env` 读取

### 10. `nginx.conf`（根目录）

- `/` → frontend:3000
- `/api/` → backend:8000（附带 X-Real-IP 等 header）
- `/uploads/` → backend:8000（带缓存）
- `/_next/static/` → frontend:3000（长期缓存 immutable）
- `/docs`、`/openapi.json`、`/redoc` → backend:8000（调试用）
- `client_max_body_size 5M`

### 11. `.env.example`（根目录）

```bash
SECRET_KEY=changeme-use-openssl-rand-hex-32
ALLOWED_ORIGINS=http://YOUR_SERVER_IP
```

### 12. `docs/DEPLOYMENT.md`

部署步骤文档，包含：服务器准备、Docker 安装、项目克隆、环境配置、构建启动、数据库初始化、常用命令等。

## 已知约束

1. **NEXT_PUBLIC 变量构建时绑定**：`NEXT_PUBLIC_API_URL` 在 Next.js 中构建时替换，无法运行时修改。Nginx 架构下用相对路径 `/api` 无需改。
2. **SQLite 单 worker**：不支持并发写入，uvicorn 用 `--workers 1`。
3. **上传是 base64 存储**：当前头像上传是 base64 编码存数据库，`/uploads` 静态挂载目前未使用，保留以备未来文件上传。
4. **无 HTTPS**：当前仅 HTTP，后续可在 Nginx 层加 Let's Encrypt。

## 验证方式

1. 本地验证代码改动：`cd sc-backend && uv run uvicorn app.main:app --reload` + `cd sc-frontend && npm run dev` 确认开发环境不受影响
2. 服务器上执行 `docker compose build && docker compose up -d`
3. 访问 `http://SERVER_IP/` 看到前端页面
4. 访问 `http://SERVER_IP/api/health` 看到健康检查响应
5. 访问 `http://SERVER_IP/docs` 看到 Swagger 文档
