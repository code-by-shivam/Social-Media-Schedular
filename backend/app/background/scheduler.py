from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.postgres import SessionLocal
from app.models.sql_models import (
    PublishingQueue,
    Post,
    PostStatusEnum
)
from app.services.publisher_service import publish_scheduled_post


scheduler = BackgroundScheduler()


def process_publishing_queue():
    """
    Process queued posts whose scheduled time has arrived.
    """

    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        # Get queued posts that are due
        queue_items = (
            db.query(PublishingQueue)
            .join(
                Post,
                Post.post_id == PublishingQueue.post_id
            )
            .filter(
                PublishingQueue.status == "QUEUED",
                PublishingQueue.scheduled_at <= now,
                Post.status == PostStatusEnum.SCHEDULED
            )
            .order_by(
                PublishingQueue.priority.desc(),
                PublishingQueue.scheduled_at.asc()
            )
            .all()
        )

        print(
            f"[Scheduler] Found {len(queue_items)} "
            f"queued post(s) ready for publishing."
        )

        for queue_item in queue_items:

            post = queue_item.post

            print(
                f"[Scheduler] Processing queue ID: "
                f"{queue_item.queue_id}, "
                f"Post ID: {post.post_id}"
            )

            # Mark as processing
            queue_item.status = "PROCESSING"
            queue_item.attempts += 1

            db.commit()

            # Publish post
            result = publish_scheduled_post(
                db=db,
                post=post
            )

            if result.get("success"):

                queue_item.status = "PUBLISHED"

                print(
                    f"[Scheduler] Post {post.post_id} "
                    f"published successfully."
                )

            else:

                queue_item.status = "FAILED"

                print(
                    f"[Scheduler] Post {post.post_id} "
                    f"failed: {result.get('message')}"
                )

            db.commit()

    except Exception as e:

        db.rollback()

        print(
            f"[Scheduler] Error: {str(e)}"
        )

    finally:

        db.close()


def start_scheduler():
    """
    Start publishing queue scheduler.
    """

    if not scheduler.running:

        scheduler.add_job(
            process_publishing_queue,
            trigger="interval",
            minutes=1,
            id="publishing_queue_processor",
            replace_existing=True
        )

        scheduler.start()

        print(
            "[Scheduler] Publishing queue scheduler started."
        )


def stop_scheduler():
    """
    Stop publishing queue scheduler.
    """

    if scheduler.running:

        scheduler.shutdown()

        print(
            "[Scheduler] Publishing queue scheduler stopped."
        )