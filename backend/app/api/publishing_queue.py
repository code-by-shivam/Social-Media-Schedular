from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user
from app.schemas.post import UpdateQueuePriorityRequest
from app.models.sql_models import (
    User,
    Post,
    PublishingQueue,
    PostStatusEnum
)

router = APIRouter(
    prefix="/publishing-queue",
    tags=["Publishing Queue"]
)

# Frontend: Get the current user's publishing queue.
@router.get("/")
def get_publishing_queue(
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

    # Get user's queue items
    queue_items = (
        db.query(PublishingQueue)
        .join(
            Post,
            Post.post_id == PublishingQueue.post_id
        )
        .filter(
            Post.user_id == db_user.user_id
        )
        .order_by(
            PublishingQueue.priority.desc(),
            PublishingQueue.scheduled_at.asc()
        )
        .all()
    )

    return {
        "total": len(queue_items),
        "queue": [
            {
                "queue_id": item.queue_id,
                "post_id": item.post_id,
                "priority": item.priority,
                "attempts": item.attempts,
                "scheduled_at": item.scheduled_at,
                "status": item.status,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            }
            for item in queue_items
        ]
    }

# Frontend: Fetch a single queue item by ID.
@router.get("/{queue_id}")
def get_queue_item(
    queue_id: int,
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

    # Find queue item belonging to user's post
    queue_item = (
        db.query(PublishingQueue)
        .join(
            Post,
            Post.post_id == PublishingQueue.post_id
        )
        .filter(
            PublishingQueue.queue_id == queue_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not queue_item:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found"
        )

    return {
        "message": "Queue item fetched successfully",
        "queue": {
            "queue_id": queue_item.queue_id,
            "post_id": queue_item.post_id,
            "priority": queue_item.priority,
            "attempts": queue_item.attempts,
            "scheduled_at": queue_item.scheduled_at,
            "status": queue_item.status,
            "created_at": queue_item.created_at,
            "updated_at": queue_item.updated_at
        }
    }

# Frontend: Update the priority of a queue item.
@router.patch("/{queue_id}/priority")
def update_queue_priority(
    queue_id: int,
    request: UpdateQueuePriorityRequest,
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

    # Find queue item belonging to user's post
    queue_item = (
        db.query(PublishingQueue)
        .join(
            Post,
            Post.post_id == PublishingQueue.post_id
        )
        .filter(
            PublishingQueue.queue_id == queue_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not queue_item:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found"
        )

    # Don't change priority after processing
    if queue_item.status in ["PROCESSING", "PUBLISHED"]:
        raise HTTPException(
            status_code=400,
            detail="Priority cannot be changed for this queue item"
        )

    # Update priority
    queue_item.priority = request.priority

    try:
        db.commit()
        db.refresh(queue_item)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update queue priority"
        )

    return {
        "message": "Queue priority updated successfully",
        "queue": {
            "queue_id": queue_item.queue_id,
            "post_id": queue_item.post_id,
            "priority": queue_item.priority,
            "attempts": queue_item.attempts,
            "scheduled_at": queue_item.scheduled_at,
            "status": queue_item.status,
            "updated_at": queue_item.updated_at
        }
    }

# Frontend: Cancel a queued post before it is published.
@router.patch("/{queue_id}/cancel")
def cancel_queue_item(
    queue_id: int,
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

    # Find queue item belonging to user's post
    queue_item = (
        db.query(PublishingQueue)
        .join(
            Post,
            Post.post_id == PublishingQueue.post_id
        )
        .filter(
            PublishingQueue.queue_id == queue_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not queue_item:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found"
        )

    # Only queued items can be cancelled
    if queue_item.status != "QUEUED":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Queue item cannot be cancelled "
                f"because its current status is "
                f"{queue_item.status}"
            )
        )

    try:
        # Update queue status
        queue_item.status = "CANCELLED"

        # Also update post status
        post = (
            db.query(Post)
            .filter(
                Post.post_id == queue_item.post_id
            )
            .first()
        )

        if post:
            post.status = PostStatusEnum.CANCELLED

        db.commit()

        db.refresh(queue_item)

    except Exception as exc:
        db.rollback()

        print(f"Cancel queue item error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

    return {
        "message": "Queue item cancelled successfully",
        "queue": {
            "queue_id": queue_item.queue_id,
            "post_id": queue_item.post_id,
            "priority": queue_item.priority,
            "attempts": queue_item.attempts,
            "scheduled_at": queue_item.scheduled_at,
            "status": queue_item.status,
            "updated_at": queue_item.updated_at
        },
        "post_status": (
            post.status.value
            if post
            else None
        )
    }

# Frontend: Retry a failed queue item.
@router.post("/{queue_id}/retry")
def retry_queue_item(
    queue_id: int,
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

    # Find queue item belonging to user's post
    queue_item = (
        db.query(PublishingQueue)
        .join(
            Post,
            Post.post_id == PublishingQueue.post_id
        )
        .filter(
            PublishingQueue.queue_id == queue_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not queue_item:
        raise HTTPException(
            status_code=404,
            detail="Queue item not found"
        )

    # Only failed items can be retried
    if queue_item.status != "FAILED":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only failed queue items can be retried. "
                f"Current status: {queue_item.status}"
            )
        )

    # Maximum retry limit
    MAX_RETRIES = 3

    if queue_item.attempts >= MAX_RETRIES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Maximum retry limit of "
                f"{MAX_RETRIES} reached"
            )
        )

    try:
        # Increment attempts
        queue_item.attempts += 1

        # Put back into queue
        queue_item.status = "QUEUED"

        # Get related post
        post = (
            db.query(Post)
            .filter(
                Post.post_id == queue_item.post_id
            )
            .first()
        )

        if post:
            post.status = PostStatusEnum.SCHEDULED

        db.commit()

        db.refresh(queue_item)

    except Exception as exc:
        db.rollback()

        print(f"Retry queue item error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to retry queue item"
        )

    return {
        "message": "Queue item added for retry",
        "queue": {
            "queue_id": queue_item.queue_id,
            "post_id": queue_item.post_id,
            "priority": queue_item.priority,
            "attempts": queue_item.attempts,
            "scheduled_at": queue_item.scheduled_at,
            "status": queue_item.status,
            "updated_at": queue_item.updated_at
        },
        "post_status": (
            post.status.value
            if post
            else None
        )
    }


