# 安全修复设计方案

## 概述

修复登录注册功能的严重安全问题，提升系统安全性。

## 修复内容

### 1. SECRET_KEY 强化

**问题**：
当前配置文件使用弱密钥：
- `.env`: `your-random-secret-key-here`
- `.env.docker`: `your-production-secret-key-change-this`
- `sc-backend/.env`: `dev-secret-key-not-for-production`

**解决方案**：
1. 生成 64 字节的强随机密钥
2. 更新所有配置文件中的 SECRET_KEY

**文件变更**：
- `.env` - 更新 SECRET_KEY（开发环境）
- `.env.docker` - 更新 SECRET_KEY（生产环境示例）
- `sc-backend/.env` - 更新 SECRET_KEY（本地开发）

**实现细节**：
```bash
# 生成强密钥
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**风险**：
- 生成新密钥后，所有现有 Token 将失效
- 用户需要重新登录

---

### 2. CORS 配置修复

**问题**：
当前 CORS 配置过于宽松：
```python
allow_origins=["*"],           # ❌ 允许所有来源
allow_credentials=True,        # ❌ 允许凭证
```

**解决方案**：
1. 使用环境变量配置允许的来源
2. 默认允许 `localhost:3000`（开发环境）
3. 生产环境通过环境变量配置
4. **禁用 credentials**（因为允许所有来源时不能启用 credentials）

**实现细节**：
```python
# main.py
from app.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # 从环境变量读取
    allow_credentials=False,                   # 禁用 credentials
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
```

```python
# config.py
class Settings(BaseSettings):
    # CORS 配置
    cors_origins: str = "http://localhost:3000"  # 逗号分隔的来源列表
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
```

**文件变更**：
- `app/config.py` - 添加 cors_origins 配置
- `app/main.py` - 更新 CORS 中间件配置
- `.env` - 添加 CORS_ORIGINS 配置
- `.env.docker` - 添加 CORS_ORIGINS 配置示例

**配置示例**：
```env
# .env（开发环境）
CORS_ORIGINS=http://localhost:3000

# .env.docker（生产环境）
CORS_ORIGINS=http://yourdomain.com,https://yourdomain.com
```

---

### 3. 速率限制

**问题**：
登录接口没有任何速率限制，容易遭受暴力破解攻击

**解决方案**：
1. 使用内存存储的简单速率限制器
2. 每 IP 每分钟最多 5 次登录尝试
3. 无需额外依赖（不使用 slowapi）

**实现细节**：
创建 `app/middleware/rate_limit.py`：
```python
"""简单速率限制中间件"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Callable
from fastapi import Request, HTTPException, status


class RateLimiter:
    """基于内存的速率限制器"""
    
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[datetime]] = defaultdict(list)
    
    def _get_client_ip(self, request: Request) -> str:
        """获取客户端 IP"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def is_allowed(self, request: Request) -> bool:
        """检查是否允许请求"""
        client_ip = self._get_client_ip(request)
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=self.window_seconds)
        
        # 清理过期记录
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff
        ]
        
        # 检查是否超过限制
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        
        # 记录当前请求
        self.requests[client_ip].append(now)
        return True


# 全局速率限制器实例
login_limiter = RateLimiter(max_requests=5, window_seconds=60)


def rate_limit_login(request: Request):
    """登录接口速率限制依赖"""
    if not login_limiter.is_allowed(request):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录尝试过于频繁，请稍后再试",
        )
```

**文件变更**：
- 新建 `app/middleware/rate_limit.py` - 速率限制器
- `app/routers/auth.py` - 添加速率限制依赖

---

### 4. 安全响应头

**问题**：
缺少必要的安全响应头，可能导致安全漏洞

**解决方案**：
添加常用的安全响应头

**实现细节**：
在 `app/main.py` 添加中间件：
```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # 防止 MIME 类型嗅探
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # 防止点击劫持
    response.headers["X-Frame-Options"] = "DENY"
    
    # 启用浏览器 XSS 防护
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # 控制 Referrer 信息
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response
```

**文件变更**：
- `app/main.py` - 添加安全响应头中间件

---

### 5. 日志审计

**问题**：
没有记录登录成功/失败，无法追踪异常登录行为

**解决方案**：
在登录接口添加详细的日志记录，包括：
- 用户名
- 用户 ID（登录成功时）
- IP 地址
- 用户代理（User-Agent）
- 登录结果（成功/失败）
- 时间戳

**实现细节**：
在 `app/routers/auth.py` 的登录接口添加日志：
```python
import logging
from fastapi import Request

logger = logging.getLogger("supercenter.auth")

@router.post("/login", response_model=Token)
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """用户登录"""
    # 获取客户端信息
    client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "unknown")
    
    user = db.exec(
        select(User).where(User.username == data.username)
    ).first()
    
    if not user or not argon2.verify(data.password, user.password_hash):
        # 记录登录失败
        logger.warning(
            f"登录失败: username={data.username}, "
            f"ip={client_ip}, user_agent={user_agent}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    
    # 记录登录成功
    logger.info(
        f"登录成功: user_id={user.id}, username={user.username}, "
        f"ip={client_ip}, user_agent={user_agent}"
    )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)
```

**日志格式示例**：
```
2024-01-15 10:30:45 - WARNING - 登录失败: username=testuser, ip=192.168.1.100, user_agent=Mozilla/5.0...
2024-01-15 10:30:50 - INFO - 登录成功: user_id=1, username=admin, ip=192.168.1.100, user_agent=Mozilla/5.0...
```

**文件变更**：
- `app/routers/auth.py` - 添加登录日志记录（包含 IP 和 User-Agent）

---

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `.env` | 修改 | 更新 SECRET_KEY，添加 CORS_ORIGINS |
| `.env.docker` | 修改 | 更新 SECRET_KEY，添加 CORS_ORIGINS |
| `sc-backend/.env` | 修改 | 更新 SECRET_KEY |
| `app/config.py` | 修改 | 添加 cors_origins 配置 |
| `app/main.py` | 修改 | 更新 CORS 中间件，添加安全响应头 |
| `app/middleware/rate_limit.py` | 新建 | 速率限制器 |
| `app/routers/auth.py` | 修改 | 添加速率限制依赖，添加日志审计 |

## 测试计划

1. **SECRET_KEY 测试**
   - 验证新密钥已生成并更新到所有配置文件
   - 验证现有 Token 已失效（需要重新登录）

2. **CORS 测试**
   - 验证开发环境允许 `localhost:3000`
   - 验证生产环境可通过环境变量配置
   - 验证 credentials 已禁用

3. **速率限制测试**
   - 验证每 IP 每分钟最多 5 次请求
   - 验证超过限制后返回 429 状态码
   - 验证不同 IP 独立计数

4. **安全响应头测试**
   - 验证响应包含 X-Content-Type-Options
   - 验证响应包含 X-Frame-Options
   - 验证响应包含 X-XSS-Protection
   - 验证响应包含 Referrer-Policy

5. **日志审计测试**
   - 验证登录成功时记录日志
   - 验证登录失败时记录日志
   - 验证日志包含用户名、IP、User-Agent

## 回滚方案

如果出现问题，可以通过以下方式回滚：

1. 恢复 `.env`、`.env.docker`、`sc-backend/.env` 中的 SECRET_KEY
2. 恢复 `app/main.py` 中的 CORS 配置
3. 删除 `app/middleware/rate_limit.py`
4. 恢复 `app/routers/auth.py` 中的登录接口

## 注意事项

1. **Token 失效**：更新 SECRET_KEY 后，所有现有 Token 将失效，用户需要重新登录
2. **CORS 配置**：生产环境需要根据实际域名配置 CORS_ORIGINS
3. **速率限制**：内存存储的速率限制器在服务重启后会重置
4. **日志存储**：日志会输出到控制台，生产环境建议配置日志文件
