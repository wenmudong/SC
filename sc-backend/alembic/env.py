import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy import engine_from_config
from alembic import context

# 将项目根目录添加到 sys.path，确保能导入 app 模块
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import engine
from app.models import User, Blog, SystemConfig  # noqa: F401

# 导入 SQLModel 的 metadata（包含所有模型的表定义）
from sqlmodel import SQLModel

# Alembic Config 对象
config = context.config

# 配置日志
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 设置 target_metadata 为 SQLModel 的 metadata
# Alembic 会对比这个 metadata 和数据库实际表结构来生成迁移脚本
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """离线模式运行迁移（不连接数据库，只生成 SQL 脚本）"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """在线模式运行迁移（连接数据库执行）"""
    # 从 app.database 获取引擎，确保与应用使用相同的数据库连接配置
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
