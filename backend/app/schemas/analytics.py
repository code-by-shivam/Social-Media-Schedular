from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user
from app.models.sql_models import User, Post, PostAnalytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/posts/{post_id}")
def get_post_analytics(
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

    # Check that post belongs to logged-in user
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

    # Get analytics records
    analytics = (
        db.query(PostAnalytics)
        .filter(
            PostAnalytics.post_id == post_id
        )
        .order_by(
            PostAnalytics.record_date.desc()
        )
        .all()
    )

    return {
        "message": "Post analytics fetched successfully",
        "post": {
            "post_id": post.post_id,
            "title": post.title,
            "status": post.status.value
        },
        "total_records": len(analytics),
        "analytics": [
            {
                "analytics_id": item.analytics_id,
                "likes": item.likes,
                "comments": item.comments,
                "shares": item.shares,
                "clicks": item.clicks,
                "reach": item.reach,
                "impressions": item.impressions,
                "saves": item.saves,
                "engagement_rate": item.engagement_rate,
                "video_views": item.video_views,
                "followers_gained": item.followers_gained,
                "record_date": item.record_date
            }
            for item in analytics
        ]
    }