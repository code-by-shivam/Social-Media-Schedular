from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.sql_models import RecurringFrequencyEnum



class UpdatePostRequest(BaseModel):
    social_account_id: Optional[int] = None
    campaign_id: Optional[int] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class PostResponse(BaseModel):
    post_id: int
    user_id: int
    social_account_id: int
    campaign_id: Optional[int]
    title: Optional[str]
    caption: Optional[str]
    media_url: Optional[str] = None    
    status: str
    scheduled_time: Optional[datetime]
    published_time: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class CreateDraftRequest(BaseModel):
    social_account_id: int
    campaign_id: Optional[int] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    

class ScheduleDraftRequest(BaseModel):
    scheduled_time: datetime

class CreateRecurringRequest(BaseModel):
    frequency: RecurringFrequencyEnum
    start_date: datetime
    end_date: Optional[datetime] = None
    cron_expression: Optional[str] = None

class UpdateRecurringRequest(BaseModel):
    frequency: Optional[RecurringFrequencyEnum] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    cron_expression: Optional[str] = None
    is_active: Optional[bool] = None

class ToggleRecurringRequest(BaseModel):
    is_active: bool

class UpdateQueuePriorityRequest(BaseModel):
    priority: int = Field(..., ge=1, le=10)