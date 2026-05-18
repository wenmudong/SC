import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import create_db_and_tables
from app.routers.api import api as api_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.upload import router as upload_router
from app.routers.blogs import router as blogs_router
from app.routers.comments import router as comments_router
from app.routers.admin import router as admin_router
from app.routers.tools import router as tools_router

logger = logging.getLogger("supercenter")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"未处理异常: {request.method} {request.url.path} - {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误，请稍后重试"},
    )

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 响应压缩（阈值 1000 字节）
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 注册路由
app.include_router(api_router, prefix="/api")
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(upload_router)
app.include_router(blogs_router)
app.include_router(comments_router)
app.include_router(admin_router)
app.include_router(tools_router)

# 挂载静态文件目录（用于访问上传的头像）
uploads_path = Path(settings.upload_dir)
if not uploads_path.exists():
    uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
