import redis
from ..core.config import settings


def get_redis() -> redis.Redis:
    return redis.from_url(settings.redis_url)


