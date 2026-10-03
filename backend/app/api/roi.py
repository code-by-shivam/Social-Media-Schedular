from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.security import get_current_user

from app.models.sql_models import (
    User,
    Campaign,
    CampaignROI
)


router = APIRouter(
    prefix="/roi",
    tags=["Campaign ROI"]
)


@router.get("/campaigns/{campaign_id}")
def get_campaign_roi(
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

    roi_records = (
        db.query(CampaignROI)
        .filter(
            CampaignROI.campaign_id == campaign_id
        )
        .order_by(
            CampaignROI.record_date.desc()
        )
        .all()
    )

    total_spend = sum(
        float(item.total_spend or 0)
        for item in roi_records
    )

    total_revenue = sum(
        float(item.revenue or 0)
        for item in roi_records
    )

    total_conversions = sum(
        item.conversions or 0
        for item in roi_records
    )

    total_cost_per_conversion = (
        total_spend / total_conversions
        if total_conversions > 0
        else 0
    )

    roi_percentage = (
        ((total_revenue - total_spend) / total_spend) * 100
        if total_spend > 0
        else 0
    )

    return {
        "message": "Campaign ROI fetched successfully",

        "campaign": {
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "budget": campaign.budget,
            "status": campaign.status.value
        },

        "roi": {
            "total_spend": round(total_spend, 2),
            "revenue": round(total_revenue, 2),
            "conversions": total_conversions,
            "cost_per_conversion": round(
                total_cost_per_conversion,
                2
            ),
            "roi_percentage": round(
                roi_percentage,
                2
            )
        },

        "total_records": len(roi_records),

        "records": [
            {
                "roi_id": item.roi_id,
                "total_spend": float(item.total_spend),
                "revenue": float(item.revenue),
                "conversions": item.conversions,
                "cost_per_conversion": float(
                    item.cost_per_conversion
                ),
                "roi_percentage": float(
                    item.roi_percentage
                ),
                "record_date": item.record_date
            }
            for item in roi_records
        ]
    }


# Frontend: Compare ROI across multiple campaigns for benchmarking and reporting.
@router.get("/compare")  
def compare_campaign_roi(
    campaign_ids: list[int] = Query(...),
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

    if len(campaign_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two campaign IDs are required"
        )

    campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.campaign_id.in_(campaign_ids),
            Campaign.user_id == db_user.user_id
        )
        .all()
    )

    found_ids = {campaign.campaign_id for campaign in campaigns}

    missing_ids = set(campaign_ids) - found_ids

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Campaigns not found: {list(missing_ids)}"
        )

    comparison = []

    for campaign in campaigns:

        roi_records = (
            db.query(CampaignROI)
            .filter(
                CampaignROI.campaign_id == campaign.campaign_id
            )
            .all()
        )

        total_spend = sum(
            float(item.total_spend or 0)
            for item in roi_records
        )

        total_revenue = sum(
            float(item.revenue or 0)
            for item in roi_records
        )

        total_conversions = sum(
            item.conversions or 0
            for item in roi_records
        )

        cost_per_conversion = (
            total_spend / total_conversions
            if total_conversions > 0
            else 0
        )

        roi_percentage = (
            ((total_revenue - total_spend) / total_spend) * 100
            if total_spend > 0
            else 0
        )

        comparison.append({
            "campaign_id": campaign.campaign_id,
            "campaign_name": campaign.campaign_name,
            "total_spend": round(total_spend, 2),
            "revenue": round(total_revenue, 2),
            "conversions": total_conversions,
            "cost_per_conversion": round(
                cost_per_conversion,
                2
            ),
            "roi_percentage": round(
                roi_percentage,
                2
            )
        })

    comparison.sort(
        key=lambda item: item["roi_percentage"],
        reverse=True
    )

    return {
        "message": "Campaign ROI comparison fetched successfully",
        "total_campaigns": len(comparison),
        "comparison": comparison
    }