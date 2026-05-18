"""数据库种子脚本 - 创建初始管理员和博主账号"""
from getpass import getpass
from sqlmodel import Session, select
from passlib.hash import argon2

from app.database import engine, create_db_and_tables
from app.models import User


def seed():
    create_db_and_tables()

    with Session(engine) as db:
        # 检查是否已有用户
        existing = db.exec(select(User)).first()
        if existing:
            print("数据库中已有用户，跳过种子数据创建。")
            return

        print("=== 创建初始账号 ===\n")

        # 博主账号
        blogger_username = input("博主用户名 [blogger]: ").strip() or "blogger"
        blogger_email = input("博主邮箱 [blogger@example.com]: ").strip() or "blogger@example.com"
        blogger_password = getpass("博主密码: ")
        if not blogger_password:
            print("密码不能为空！")
            return

        blogger = User(
            username=blogger_username,
            email=blogger_email,
            password_hash=argon2.hash(blogger_password),
            role="blogger",
        )
        db.add(blogger)

        # 管理员账号
        admin_username = input("\n管理员用户名 [admin]: ").strip() or "admin"
        admin_email = input("管理员邮箱 [admin@example.com]: ").strip() or "admin@example.com"
        admin_password = getpass("管理员密码: ")
        if not admin_password:
            print("密码不能为空！")
            return

        admin = User(
            username=admin_username,
            email=admin_email,
            password_hash=argon2.hash(admin_password),
            role="admin",
        )
        db.add(admin)

        db.commit()
        print(f"\n创建成功！")
        print(f"  博主: {blogger_username}")
        print(f"  管理员: {admin_username}")


if __name__ == "__main__":
    seed()
