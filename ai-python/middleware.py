import time
from collections import defaultdict
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings

security = HTTPBearer(auto_error=False)

_rate_limit_store: dict[str, list[float]] = defaultdict(list)


async def verify_api_key(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> None:
    if settings.ENVIRONMENT == "development" and not settings.AI_SERVICE_API_KEY:
        return

    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = credentials.credentials
    if token != settings.AI_SERVICE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


async def rate_limit_middleware(request: Request, call_next):
    if settings.ENVIRONMENT == "development":
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - 60

    _rate_limit_store[client_ip] = [
        t for t in _rate_limit_store[client_ip] if t > window_start
    ]

    if len(_rate_limit_store[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
        )

    _rate_limit_store[client_ip].append(now)
    return await call_next(request)
