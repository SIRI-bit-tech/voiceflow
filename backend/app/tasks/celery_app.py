from celery import Celery
from ..core.config import settings


celery_app = Celery(
    "voiceflow",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(task_acks_late=True, worker_prefetch_multiplier=1)


