from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.sql_models import CampaignPlatformEnum
from app.models.sql_models import (
    CampaignPlatformEnum,
    CampaignStatusEnum
)

class CampaignCreateRequest(BaseModel):
    campaign_name: str = Field(..., min_length=1, max_length=100)
    objective: str | None = None
    budget: Decimal | None = Field(default=None, ge=0)
    platform: CampaignPlatformEnum
    start_date: date
    end_date: date

class CampaignUpdateRequest(BaseModel):
    campaign_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )
    objective: str | None = None
    budget: Decimal | None = Field(
        default=None,
        ge=0
    )
    platform: CampaignPlatformEnum | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: CampaignStatusEnum | None = None