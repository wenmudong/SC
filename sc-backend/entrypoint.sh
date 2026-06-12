#!/bin/sh
# 后端入口脚本

# 运行种子脚本（创建初始用户）
uv run python -m scripts.seed_db || true

# 启动FastAPI服务器
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
