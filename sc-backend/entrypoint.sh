#!/bin/sh
# 后端入口脚本

# 确保 Alembic 版本表存在（首次部署时自动处理已有数据库）
echo "检查 Alembic 版本表..."
uv run python -m scripts.ensure_alembic

# 运行数据库迁移（Alembic）
echo "运行数据库迁移..."
uv run alembic upgrade head

# 运行种子脚本（创建初始用户）
echo "执行种子数据脚本..."
uv run python -m scripts.seed_db || true

# 启动FastAPI服务器
echo "启动应用服务器..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
