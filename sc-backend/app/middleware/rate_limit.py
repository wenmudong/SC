"""简单速率限制中间件"""
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status


class RateLimiter:
    """基于内存的速率限制器"""

    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[datetime]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """获取客户端 IP"""
        # 始终使用连接的客户端 IP（不可伪造）
        if request.client:
            return request.client.host
        return "unknown"

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
