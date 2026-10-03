import redis.asyncio as redis

from app.core.config import settings


redis_client: redis.Redis | None = None


async def init_redis():
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=50,
            socket_connect_timeout=5,
            socket_timeout=5,
            health_check_interval=30,
        )
        await redis_client.ping()
        print("[Redis] Connected successfully.")
    except Exception as e:
        print(f"[Redis] Warning: Could not connect to Redis ({e}). Redis features will be disabled.")
        redis_client = None


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.aclose()
        redis_client = None
        print("[Redis] Connection closed.")