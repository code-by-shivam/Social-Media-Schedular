from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user

from app.models.sql_models import (
    Campaign,
    CampaignPerformance,
    CampaignStatusEnum,
    User
)

from app.schemas.campaign import (
    CampaignCreateRequest,
    CampaignUpdateRequest
)


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)

# Frontend: Create a new campaign with objectives, dates, and platform targeting.
@router.post("/")
def create_campaign(
    data: CampaignCreateRequest,
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

    if data.end_date <= data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be greater than start date"
        )

    campaign = Campaign(
        user_id=db_user.user_id,
        campaign_name=data.campaign_name,
        objective=data.objective,
        budget=data.budget,
        platform=data.platform,
        start_date=data.start_date,
        end_date=data.end_date,
        status=CampaignStatusEnum.ACTIVE
    )

    try:
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create campaign"
        )

    return {
        "message": "Campaign created successfully",
        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "objective": campaign.objective,
            "budget": campaign.budget,
            "platform": campaign.platform.value,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "status": campaign.status.value,
            "created_at": campaign.created_at,
            "updated_at": campaign.updated_at
        }
    }

# Frontend: List all campaigns for the signed-in user.
@router.get("/")
def get_all_campaigns(
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

    campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.user_id == db_user.user_id
        )
        .order_by(Campaign.created_at.desc())
        .all()
    )

    return {
        "total_campaigns": len(campaigns),
        "campaigns": [
            {
                "campaign_id": campaign.campaign_id,
                "campaign_name": campaign.campaign_name,
                "objective": campaign.objective,
                "budget": campaign.budget,
                "platform": campaign.platform.value,
                "start_date": campaign.start_date,
                "end_date": campaign.end_date,
                "status": campaign.status.value,
                "created_at": campaign.created_at,
                "updated_at": campaign.updated_at
            }
            for campaign in campaigns
        ]
    }


# Frontend: Get a campaign summary with total reach, engagement, and performance metrics.
@router.get("/{campaign_id}/tracking/summary")
def get_campaign_tracking_summary(
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

    total_impressions = sum(
        item.impressions or 0 for item in performance
    )

    total_reach = sum(
        item.reach or 0 for item in performance
    )

    total_likes = sum(
        item.likes or 0 for item in performance
    )

    total_comments = sum(
        item.comments or 0 for item in performance
    )

    total_shares = sum(
        item.shares or 0 for item in performance
    )

    total_clicks = sum(
        item.clicks or 0 for item in performance
    )

    total_saves = sum(
        item.saves or 0 for item in performance
    )

    total_video_views = sum(
        item.video_views or 0 for item in performance
    )

    total_conversions = sum(
        item.conversions or 0 for item in performance
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
        "campaign_id": campaign.campaign_id,
        "campaign_name": campaign.campaign_name,
        "platform": campaign.platform.value,
        "status": campaign.status.value,
        "summary": {
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
        }
    }


# Frontend: Get time-series performance data for a campaign.
@router.get("/{campaign_id}/performance")
def get_campaign_performance(
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
        .order_by(
            CampaignPerformance.record_date.asc()
        )
        .all()
    )

    return {
        "campaign_id": campaign.campaign_id,
        "campaign_name": campaign.campaign_name,
        "total_records": len(performance),
        "performance": [
            {
                "performance_id": item.performance_id,
                "platform": item.platform.value,
                "record_date": item.record_date,
                "impressions": item.impressions,
                "reach": item.reach,
                "likes": item.likes,
                "comments": item.comments,
                "shares": item.shares,
                "clicks": item.clicks,
                "saves": item.saves,
                "video_views": item.video_views,
                "engagement_rate": item.engagement_rate,
                "conversions": item.conversions
            }
            for item in performance
        ]
    }

# Frontend: Get detailed tracking metrics for the campaign over time.
@router.get("/{campaign_id}/tracking")
def get_campaign_tracking(
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
        .order_by(
            CampaignPerformance.record_date.desc()
        )
        .all()
    )

    return {
        "message": "Campaign tracking data fetched successfully",
        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "platform": campaign.platform.value,
            "status": campaign.status.value,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date
        },
        "performance": [
            {
                "performance_id": item.performance_id,
                "platform": item.platform.value,
                "impressions": item.impressions,
                "reach": item.reach,
                "likes": item.likes,
                "comments": item.comments,
                "shares": item.shares,
                "clicks": item.clicks,
                "saves": item.saves,
                "video_views": item.video_views,
                "engagement_rate": item.engagement_rate,
                "conversions": item.conversions,
                "record_date": item.record_date
            }
            for item in performance
        ]
    }


# Frontend: Fetch a single campaign record and its metadata.
@router.get("/{campaign_id}")
def get_campaign(
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

    return {
        "message": "Campaign fetched successfully",
        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "objective": campaign.objective,
            "budget": campaign.budget,
            "platform": campaign.platform.value,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "status": campaign.status.value,
            "created_at": campaign.created_at,
            "updated_at": campaign.updated_at
        }
    }

# Frontend: Update campaign fields such as budget, dates, and objective.
@router.put("/{campaign_id}")
def update_campaign(
    campaign_id: int,
    data: CampaignUpdateRequest,
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

    update_data = data.model_dump(exclude_unset=True)

    start_date = update_data.get(
        "start_date",
        campaign.start_date
    )

    end_date = update_data.get(
        "end_date",
        campaign.end_date
    )

    if end_date and start_date and end_date <= start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be greater than start date"
        )

    for key, value in update_data.items():
        setattr(campaign, key, value)

    try:
        db.commit()
        db.refresh(campaign)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update campaign"
        )

    return {
        "message": "Campaign updated successfully",
        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "objective": campaign.objective,
            "budget": campaign.budget,
            "platform": campaign.platform.value,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "status": campaign.status.value,
            "created_at": campaign.created_at,
            "updated_at": campaign.updated_at
        }
    }

# Frontend: Delete a campaign after confirmation from the current user.
@router.delete("/{campaign_id}")
def delete_campaign(
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

    try:
        db.delete(campaign)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete campaign"
        )

    return {
        "message": "Campaign deleted successfully",
        "deleted_campaign_id": campaign_id
    }


    