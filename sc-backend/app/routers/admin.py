from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import engine
from app.models.system import SystemConfig
from app.models.user import User
from app.schemas.system import (
    SystemConfigCreate,
    SystemConfigUpdate,
    SystemConfigResponse,
    SystemConfigListResponse,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """权限依赖：仅限管理员"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="需要管理员权限",
        )
    return current_user


@router.get("/config", response_model=SystemConfigListResponse)
def get_all_configs(current_user: User = Depends(require_admin)):
    """获取所有系统配置"""
    with Session(engine) as session:
        configs = session.exec(select(SystemConfig)).all()
        return SystemConfigListResponse(configs=configs, total=len(configs))


@router.get("/config/{key}", response_model=SystemConfigResponse)
def get_config(key: str, current_user: User = Depends(require_admin)):
    """获取单个系统配置"""
    with Session(engine) as session:
        config = session.exec(select(SystemConfig).where(SystemConfig.key == key)).first()
        if not config:
            raise HTTPException(status_code=404, detail="配置不存在")
        return config


@router.post("/config", response_model=SystemConfigResponse, status_code=201)
def create_config(config_data: SystemConfigCreate, current_user: User = Depends(require_admin)):
    """创建系统配置"""
    with Session(engine) as session:
        existing = session.exec(select(SystemConfig).where(SystemConfig.key == config_data.key)).first()
        if existing:
            raise HTTPException(status_code=400, detail="配置键已存在")

        config = SystemConfig(**config_data.model_dump())
        session.add(config)
        session.commit()
        session.refresh(config)
        return config


@router.put("/config/{key}", response_model=SystemConfigResponse)
def update_config(key: str, config_data: SystemConfigUpdate, current_user: User = Depends(require_admin)):
    """更新系统配置（不存在则创建）"""
    with Session(engine) as session:
        config = session.exec(select(SystemConfig).where(SystemConfig.key == key)).first()

        if not config:
            # 不存在则创建
            config = SystemConfig(key=key, value=config_data.value)
            session.add(config)
        else:
            # 存在则更新
            config.value = config_data.value
            if config_data.description is not None:
                config.description = config_data.description
            session.add(config)

        session.commit()
        session.refresh(config)
        return config


@router.delete("/config/{key}", status_code=204)
def delete_config(key: str, current_user: User = Depends(require_admin)):
    """删除系统配置"""
    with Session(engine) as session:
        config = session.exec(select(SystemConfig).where(SystemConfig.key == key)).first()
        if not config:
            raise HTTPException(status_code=404, detail="配置不存在")

        session.delete(config)
        session.commit()
        return None
