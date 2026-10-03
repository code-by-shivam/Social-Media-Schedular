from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user

from app.models.sql_models import (
    User,
    Post,
    SocialAccount,
    PublishingLog,
    PostStatusEnum
)

from app.services.social.social_factory import SocialFactory

def get_db_user(db: Session, current_user):

    user = (
        db.query(User)
        .filter(
            User.email == current_user["sub"]
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)

# Frontend: Publish a post to its connected social platform.
@router.post("/publish/{post_id}")
def publish_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Find post
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

    # Check if already published
    if post.status == PostStatusEnum.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Post is already published"
        )

    # Find social account
    social_account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.social_account_id == post.social_account_id,
            SocialAccount.user_id == db_user.user_id
        )
        .first()
    )

    if not social_account:
        raise HTTPException(
            status_code=404,
            detail="Social account not found"
        )

    try:
        # Get platform service
        service = SocialFactory.get_service(
            social_account.platform_name
        )

        # Publish post
        response = service.publish_post(
            caption=post.caption,
            media_url=post.media_url
        )

        # Check publish response
        if not response["success"]:

            log = PublishingLog(
                post_id=post.post_id,
                status="FAILED",
                message=response.get(
                    "message",
                    "Publishing failed"
                ),
                platform_response=str(response)
            )

            db.add(log)
            db.commit()

            raise HTTPException(
                status_code=500,
                detail="Publishing failed"
            )

        # Update post
        post.status = PostStatusEnum.PUBLISHED
        post.published_time = datetime.now(timezone.utc)

        # Create publishing log
        log = PublishingLog(
            post_id=post.post_id,
            status="SUCCESS",
            message=response["message"],
            platform_response=str(response)
        )

        db.add(log)

        db.commit()

        db.refresh(post)

        return {
            "message": "Post published successfully",
            "platform": response["platform"],
            "platform_post_id": response["platform_post_id"],
            "post": {
                "post_id": post.post_id,
                "title": post.title,
                "caption": post.caption,
                "status": post.status.value,
                "published_time": post.published_time
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        try:

            failed_log = PublishingLog(
                post_id=post.post_id,
                status="FAILED",
                message=str(e)
            )

            db.add(failed_log)
            db.commit()

        except Exception:
            db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )


