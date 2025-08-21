import redis.asyncio as redis
from ..core.config import settings


def get_redis() -> redis.Redis:
    # Use asyncio Redis client; return text strings instead of bytes
    return redis.from_url(settings.redis_url, decode_responses=True)


