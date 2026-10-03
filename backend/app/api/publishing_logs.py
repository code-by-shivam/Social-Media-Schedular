from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user

from app.models.sql_models import (
    User,
    PublishingLog,
    Post
)


router = APIRouter(
    prefix="/publishing-logs",
    tags=["Publishing Logs"]
)


# Frontend: Get publishing history for the current user.
@router.get("/")
def get_publishing_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = (
        db.query(User)
        .filter(
            User.email == current_user["sub"]
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Get user's publishing logs
    logs = (
        db.query(PublishingLog)
        .join(
            Post,
            Post.post_id == PublishingLog.post_id
        )
        .filter(
            Post.user_id == db_user.user_id
        )
        .order_by(
            PublishingLog.created_at.desc()
        )
        .all()
    )

    return {
        "total_logs": len(logs),
        "logs": [
            {
                "log_id": log.log_id,
                "post_id": log.post_id,
                "status": log.status,
                "message": log.message,
                "platform_response": log.platform_response,
                "created_at": log.created_at,
                "updated_at": log.updated_at
            }
            for log in logs
        ]
    }



# Frontend: Fetch one publishing log entry by ID.
@router.get("/{log_id}")
def get_publishing_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = (
        db.query(User)
        .filter(
            User.email == current_user["sub"]
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Find log and verify ownership through Post
    log = (
        db.query(PublishingLog)
        .join(
            Post,
            Post.post_id == PublishingLog.post_id
        )
        .filter(
            PublishingLog.log_id == log_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Publishing log not found"
        )

    # Response
    return {
        "message": "Publishing log fetched successfully",
        "log": {
            "log_id": log.log_id,
            "post_id": log.post_id,
            "status": log.status,
            "message": log.message,
            "platform_response": log.platform_response,
            "created_at": log.created_at,
            "updated_at": log.updated_at
        }
    }


# Get publishing logs for a specific post 
# Frontend: Get all publishing attempts for a specific post.
@router.get("/post/{post_id}")
def get_post_publishing_logs(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = (
        db.query(User)
        .filter(
            User.email == current_user["sub"]
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Verify post belongs to logged-in user
    post = (
        db.query(Post)
        .filter(
            Post.post_id == post_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    # Get publishing history
    logs = (
        db.query(PublishingLog)
        .filter(
            PublishingLog.post_id == post_id
        )
        .order_by(
            PublishingLog.created_at.desc()
        )
        .all()
    )

    # Response
    return {
        "post_id": post_id,
        "total_attempts": len(logs),
        "logs": [
            {
                "log_id": log.log_id,
                "status": log.status,
                "message": log.message,
                "platform_response": log.platform_response,
                "created_at": log.created_at,
                "updated_at": log.updated_at
            }
            for log in logs
        ]
    }


# Get publishing logs by status
# Frontend: Filter publishing logs by status such as SUCCESS or FAILED.
@router.get("/status/{status}")
def get_publishing_logs_by_status(
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = (
        db.query(User)
        .filter(
            User.email == current_user["sub"]
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Normalize status
    status = status.upper()
    allowed_statuses = {
        "SUCCESS",
        "FAILED",
        "PROCESSING"
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                "SUCCESS, FAILED, PROCESSING"
            )
        )

    # Get logs with the specified status for the user
    logs = (
        db.query(PublishingLog)
        .join(
            Post,
            Post.post_id == PublishingLog.post_id
        )
        .filter(
            Post.user_id == db_user.user_id,
            PublishingLog.status == status
        )
        .order_by(
            PublishingLog.created_at.desc()
        )
        .all()
    )

    # Response
    return {
        "status": status,
        "total_logs": len(logs),
        "logs": [
            {
                "log_id": log.log_id,
                "post_id": log.post_id,
                "status": log.status,
                "message": log.message,
                "platform_response": log.platform_response,
                "created_at": log.created_at,
                "updated_at": log.updated_at
            }
            for log in logs
        ]
    }


