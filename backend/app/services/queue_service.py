from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.sql_models import (
    Post,
    PublishingQueue,
    PostStatusEnum
)


def add_post_to_queue(
    db: Session,
    post: Post,
    priority: int = 1
):
    """
    Add a scheduled post to the publishing queue.
    """

    # Check if post is already in queue
    existing_queue = (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.post_id == post.post_id,
            PublishingQueue.status.in_([
                "QUEUED",
                "PROCESSING"
            ])
        )
        .first()
    )

    if existing_queue:
        return existing_queue

    # Make sure scheduled time exists
    if not post.scheduled_time:
        raise ValueError(
            "Post scheduled time is required"
        )

    queue_item = PublishingQueue(
        post_id=post.post_id,
        priority=priority,
        attempts=0,
        scheduled_at=post.scheduled_time,
        status="QUEUED"
    )

    db.add(queue_item)
    db.commit()
    db.refresh(queue_item)

    return queue_item