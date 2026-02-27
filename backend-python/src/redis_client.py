import redis
from .config import REDIS_HOST

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=6379,
    decode_responses=True
)
