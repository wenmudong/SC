"""确保 Alembic 版本表存在并标记为最新版本

用于首次部署时自动处理已有数据库：
1. 检查 alembic_version 表是否存在
2. 如果不存在，创建表并标记为当前版本
3. 如果已存在，不做任何操作
"""
import sqlite3
import os


def ensure_alembic_version(db_path: str) -> bool:
    """确保 alembic_version 表存在并标记为最新版本

    Returns:
        True 如果是首次初始化（新创建了 alembic_version 表）
        False 如果表已存在（无需操作）
    """
    if not os.path.exists(db_path):
        print(f"数据库文件不存在: {db_path}")
        return False

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 检查 alembic_version 表是否已存在
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'"
    )
    if cursor.fetchone():
        # 表已存在，检查当前版本
        cursor.execute("SELECT version_num FROM alembic_version")
        row = cursor.fetchone()
        if row:
            print(f"Alembic 版本表已存在，当前版本: {row[0]}")
        else:
            print("Alembic 版本表已存在但为空")
        conn.close()
        return False

    # 表不存在，创建并标记为最新版本
    cursor.execute("""
        CREATE TABLE alembic_version (
            version_num VARCHAR(32) NOT NULL,
            CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
        )
    """)

    # 标记为版本 001（仅 baseline），这样后续 alembic upgrade head 会执行 002 迁移
    # 002 迁移会清理旧数据库中的 preferred_language 列
    cursor.execute("INSERT INTO alembic_version (version_num) VALUES ('001')")

    conn.commit()
    conn.close()

    print(f"已为数据库初始化 Alembic 版本表，标记为版本 001")
    return True


if __name__ == "__main__":
    # 数据库路径（容器内）
    db_path = os.environ.get("DATABASE_PATH", "./data/supercenter.db")
    ensure_alembic_version(db_path)
