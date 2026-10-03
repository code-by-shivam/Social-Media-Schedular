from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user

from app.models.sql_models import (
    User,
    Campaign,
    Post,
    CampaignPerformance,
    PostAnalytics
)


router = APIRouter(
    prefix="/reports",
    tags=["Campaign Reports"]
)


# Frontend: Generate a full campaign report with totals, engagement, and summary metrics.
@router.get("/campaigns/{campaign_id}")
def get_campaign_report(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = (
        db.query(User)
        .filter(User.email == current_user["sub"])
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Get campaign owned by user
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.campaign_id == campaign_id,
            Campaign.user_id == db_user.user_id
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    # Get campaign performance
    performance = (
        db.query(CampaignPerformance)
        .filter(
            CampaignPerformance.campaign_id == campaign_id
        )
        .all()
    )

    # Get campaign posts
    posts = (
        db.query(Post)
        .filter(
            Post.campaign_id == campaign_id,
            Post.user_id == db_user.user_id
        )
        .all()
    )

    post_ids = [post.post_id for post in posts]

    # Get post analytics
    post_analytics = []

    if post_ids:
        post_analytics = (
            db.query(PostAnalytics)
            .filter(
                PostAnalytics.post_id.in_(post_ids)
            )
            .all()
        )

    # Performance totals
    total_impressions = sum(
        item.impressions or 0
        for item in performance
    )

    total_reach = sum(
        item.reach or 0
        for item in performance
    )

    total_likes = sum(
        item.likes or 0
        for item in performance
    )

    total_comments = sum(
        item.comments or 0
        for item in performance
    )

    total_shares = sum(
        item.shares or 0
        for item in performance
    )

    total_clicks = sum(
        item.clicks or 0
        for item in performance
    )

    total_saves = sum(
        item.saves or 0
        for item in performance
    )

    total_video_views = sum(
        item.video_views or 0
        for item in performance
    )

    total_conversions = sum(
        item.conversions or 0
        for item in performance
    )

    average_engagement_rate = (
        sum(
            float(item.engagement_rate or 0)
            for item in performance
        ) / len(performance)
        if performance
        else 0
    )

    # Post engagement totals
    post_likes = sum(
        item.likes or 0
        for item in post_analytics
    )

    post_comments = sum(
        item.comments or 0
        for item in post_analytics
    )

    post_shares = sum(
        item.shares or 0
        for item in post_analytics
    )

    post_clicks = sum(
        item.clicks or 0
        for item in post_analytics
    )

    post_saves = sum(
        item.saves or 0
        for item in post_analytics
    )

    total_engagements = (
        post_likes
        + post_comments
        + post_shares
        + post_clicks
        + post_saves
    )

    return {
        "message": "Campaign report generated successfully",

        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "objective": campaign.objective,
            "budget": campaign.budget,
            "platform": campaign.platform.value,
            "status": campaign.status.value,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date
        },

        "summary": {
            "total_posts": len(posts),
            "total_performance_records": len(performance),
            "total_analytics_records": len(post_analytics)
        },

        "performance": {
            "impressions": total_impressions,
            "reach": total_reach,
            "likes": total_likes,
            "comments": total_comments,
            "shares": total_shares,
            "clicks": total_clicks,
            "saves": total_saves,
            "video_views": total_video_views,
            "conversions": total_conversions,
            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        },

        "engagement": {
            "likes": post_likes,
            "comments": post_comments,
            "shares": post_shares,
            "clicks": post_clicks,
            "saves": post_saves,
            "total_engagements": total_engagements
        }
    }

# Frontend: Get a compact campaign summary for dashboard cards and overview widgets.
@router.get("/campaigns/{campaign_id}/summary")
def get_campaign_summary(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = (
        db.query(User)
        .filter(User.email == current_user["sub"])
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.campaign_id == campaign_id,
            Campaign.user_id == db_user.user_id
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    performance = (
        db.query(CampaignPerformance)
        .filter(
            CampaignPerformance.campaign_id == campaign_id
        )
        .all()
    )

    impressions = sum(
        item.impressions or 0
        for item in performance
    )

    reach = sum(
        item.reach or 0
        for item in performance
    )

    likes = sum(
        item.likes or 0
        for item in performance
    )

    comments = sum(
        item.comments or 0
        for item in performance
    )

    shares = sum(
        item.shares or 0
        for item in performance
    )

    clicks = sum(
        item.clicks or 0
        for item in performance
    )

    saves = sum(
        item.saves or 0
        for item in performance
    )

    conversions = sum(
        item.conversions or 0
        for item in performance
    )

    total_engagements = (
        likes
        + comments
        + shares
        + clicks
        + saves
    )

    average_engagement_rate = (
        sum(
            float(item.engagement_rate or 0)
            for item in performance
        ) / len(performance)
        if performance
        else 0
    )

    return {
        "message": "Campaign summary fetched successfully",

        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "platform": campaign.platform.value,
            "status": campaign.status.value
        },

        "summary": {
            "impressions": impressions,
            "reach": reach,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "clicks": clicks,
            "saves": saves,
            "total_engagements": total_engagements,
            "conversions": conversions,
            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        }
    }