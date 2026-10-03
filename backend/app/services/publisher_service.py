from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.sql_models import (
    Post,
    SocialAccount,
    PublishingLog,
    PostStatusEnum
)

from app.services.social.social_factory import SocialFactory


def publish_scheduled_post(
    db: Session,
    post: Post
):
    """
    Publish a scheduled post to its connected social media account.
    """

    # ---------------------------------------------------------
    # 1. Check post status
    # ---------------------------------------------------------

    if post.status != PostStatusEnum.SCHEDULED:
        return {
            "success": False,
            "message": "Post is not scheduled"
        }

    # ---------------------------------------------------------
    # 2. Check scheduled time
    # ---------------------------------------------------------

    if post.scheduled_time is None:
        return {
            "success": False,
            "message": "Scheduled time is missing"
        }

    now = datetime.now(timezone.utc)

    if post.scheduled_time > now:
        return {
            "success": False,
            "message": "Post is not due for publishing"
        }

    # ---------------------------------------------------------
    # 3. Get Social Account
    # ---------------------------------------------------------

    social_account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.social_account_id ==
            post.social_account_id
        )
        .first()
    )

    if not social_account:

        log = PublishingLog(
            post_id=post.post_id,
            status="FAILED",
            message="Social account not found"
        )

        db.add(log)
        db.commit()

        return {
            "success": False,
            "message": "Social account not found"
        }

    # ---------------------------------------------------------
    # 4. Check access token
    # ---------------------------------------------------------

    if not social_account.access_token:

        log = PublishingLog(
            post_id=post.post_id,
            status="FAILED",
            message="Social account access token is missing"
        )

        db.add(log)
        db.commit()

        return {
            "success": False,
            "message": "Access token is missing"
        }

    # ---------------------------------------------------------
    # 5. Get platform service
    # ---------------------------------------------------------

    try:

        service = SocialFactory.get_service(
            social_account.platform_name
        )

    except ValueError as e:

        log = PublishingLog(
            post_id=post.post_id,
            status="FAILED",
            message=str(e)
        )

        db.add(log)
        db.commit()

        return {
            "success": False,
            "message": str(e)
        }

    # ---------------------------------------------------------
    # 6. Publish post
    # ---------------------------------------------------------

    try:

        media_url = None

        if post.post_media:
            media_url = post.post_media[0].media_url

        response = service.publish_post(
            caption=post.caption or "",
            media_url=media_url
        )

    except Exception as e:

        db.rollback()

        failed_log = PublishingLog(
            post_id=post.post_id,
            status="FAILED",
            message=str(e)
        )

        db.add(failed_log)

        post.retry_count = (post.retry_count or 0) + 1

        db.commit()

        return {
            "success": False,
            "message": "Publishing failed",
            "error": str(e)
        }

    # ---------------------------------------------------------
    # 7. Check publishing response
    # ---------------------------------------------------------

    if not response.get("success"):

        failed_log = PublishingLog(
            post_id=post.post_id,
            status="FAILED",
            message=response.get(
                "message",
                "Publishing failed"
            ),
            platform_response=str(response)
        )

        db.add(failed_log)

        post.retry_count = (post.retry_count or 0) + 1

        db.commit()

        return {
            "success": False,
            "message": response.get(
                "message",
                "Publishing failed"
            )
        }

    # ---------------------------------------------------------
    # 8. Update Post
    # ---------------------------------------------------------

    post.status = PostStatusEnum.PUBLISHED

    post.published_time = datetime.now(timezone.utc)

    # ---------------------------------------------------------
    # 9. Create Publishing Log
    # ---------------------------------------------------------

    success_log = PublishingLog(
        post_id=post.post_id,
        status="SUCCESS",
        message=response.get(
            "message",
            "Post published successfully"
        ),
        platform_response=str(response)
    )

    db.add(success_log)

    # ---------------------------------------------------------
    # 10. Commit transaction
    # ---------------------------------------------------------

    db.commit()
    db.refresh(post)

    return {
        "success": True,
        "message": "Post published successfully",
        "post_id": post.post_id,
        "platform": response.get("platform"),
        "platform_post_id": response.get(
            "platform_post_id"
        ),
        "published_time": post.published_time
    }