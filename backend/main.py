from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time

from app.api.publishing_logs import router as publishing_logs_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.users import router as users_router
from app.api.social_accounts import router as social_router
from app.api.posts import router as posts_router
from app.api.publishing_queue import router as publishing_queue_router
from app.api.campaigns import router as campaigns_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.roi import router as roi_router
from app.api.social_publish import router as social_publish_router
from app.core.redis import init_redis, close_redis
from app.core.postgres import Base, engine
from app.core.mongodb import init_mongodb, close_mongodb

from app.background.scheduler import (
    start_scheduler,
    stop_scheduler
)

import app.models.sql_models  # noqa: F401


app = FastAPI(
    title="Social Media Scheduler API",
    version="1.0.0"
)


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(social_router)
app.include_router(posts_router)
app.include_router(publishing_queue_router)
app.include_router(publishing_logs_router)
app.include_router(campaigns_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(roi_router)
app.include_router(social_publish_router)


# Startup

@app.on_event("startup")
async def startup_event():

    # PostgreSQL connection / table check

    max_attempts = 10
    delay_seconds = 2

    for attempt in range(1, max_attempts + 1):

        try:

            Base.metadata.create_all(
                bind=engine
            )

            print(
                "[Database] PostgreSQL connected successfully."
            )

            break

        except OperationalError as exc:

            if attempt == max_attempts:
                raise exc

            print(
                f"PostgreSQL not ready yet "
                f"(attempt {attempt}/{max_attempts}). "
                f"Retrying in {delay_seconds} seconds..."
            )

            time.sleep(delay_seconds)

    # MongoDB
    await init_mongodb()

    # Redis
    await init_redis()

    # Scheduler
    start_scheduler()


# Shutdown

@app.on_event("shutdown")
async def shutdown_event():

    # Stop publishing scheduler
    stop_scheduler()

    # Close MongoDB connection
    await close_mongodb()

    #Redis
    await close_redis()


# Root

@app.get("/")
def root():

    return {
        "message": "Welcome to Social Media Scheduler API"
    }