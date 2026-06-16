from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_db
from app.models.system import SystemConfig

router = APIRouter(prefix="/api", tags=["config"])

# 需要全局生效的配置键列表（只读）
PUBLIC_CONFIG_KEYS = ["global_font", "navbar_config"]


@router.get("/config")
def get_public_configs(db: Session = Depends(get_db)):
    """获取公开的系统配置（无需认证，只读）"""
    configs = {}
    for key in PUBLIC_CONFIG_KEYS:
        config = db.exec(select(SystemConfig).where(SystemConfig.key == key)).first()
        if config:
            configs[key] = config.value
    return {"configs": configs}
