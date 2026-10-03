from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document
from pydantic import Field

class MediaMetadata(Document):
    user_id: int
    file_name: str
    file_type: str
    file_size: int
    storage_provider: str = "AWS_S3"
    storage_path: str
    dimensions: Optional[Dict[str, int]] = None
    tags: List[str] = []
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "media_metadata"


class RawAnalyticsLog(Document):
    post_id: int
    platform: str
    raw_response: Optional[Dict[str, Any]] = Field(default_factory=dict)
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "raw_analytics_logs"


class PublishingActivityLog(Document):
    post_id: int
    user_id: int
    action: str
    status: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "publishing_activity_logs"


class ContentDraft(Document):
    user_id: int
    template_name: str
    content_blocks: List[Dict[str, Any]] = []
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "content_drafts_library"
