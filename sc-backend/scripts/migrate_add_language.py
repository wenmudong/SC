"""
数据库迁移脚本：为 users 表添加 language 字段
"""
import sqlite3
import os

def migrate():
    """添加 language 列到 users 表"""
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "supercenter.db")

    if not os.path.exists(db_path):
        print(f"数据库文件不存在: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 检查列是否已存在
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]

    if "language" in columns:
        print("language 列已存在，跳过迁移")
        conn.close()
        return

    # 添加 language 列，默认值为 'en'
    print("添加 language 列...")
    cursor.execute("ALTER TABLE users ADD COLUMN language VARCHAR DEFAULT 'en'")

    conn.commit()
    conn.close()
    print("迁移完成！")

if __name__ == "__main__":
    migrate()
