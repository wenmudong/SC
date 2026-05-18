from pydantic_settings import BaseSettings
from datetime import timedelta


class Settings(BaseSettings):
    app_name: str = "SuperCenter API"
    debug: bool = True
    database_url: str = "sqlite:///./data/supercenter.db"

    # JWT 配置
    secret_key: str  # 必填，通过 .env 或环境变量设置
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 天过期

    # 上传配置
    upload_dir: str = "public/uploads"
    maxAvatarSize: int = 2 * 1024 * 1024  # 2MB

    # 图片压缩配置
    maxCompressSize: int = 20 * 1024 * 1024  # 单文件 20MB
    maxCompressTotalSize: int = 500 * 1024 * 1024  # 总大小 500MB
    maxCompressFiles: int = 50  # 最多 50 个文件

    class Config:
        env_file = ".env"


settings = Settings()
