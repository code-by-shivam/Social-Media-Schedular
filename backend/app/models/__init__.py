from app.models.sql_models import (
    Base,
    User,
    UserRoleEnum,
    UserStatusEnum,
    NotificationPreference,
    DashboardStatistic,
    SocialAccount,
    PlatformEnum,
    Campaign,
    CampaignPlatformEnum,
    CampaignStatusEnum,
    Post,
    PostTypeEnum,
    PostStatusEnum,
    PostMedia,
    PostAnalytics,
    PublishingQueue,
    PublishingLog,
    RecurringPostRule
)

try:
    from app.models.mongo_models import (
        MediaMetadata,
        RawAnalyticsLog,
        PublishingActivityLog,
        ContentDraft
    )
except ModuleNotFoundError:
    MediaMetadata = None
    RawAnalyticsLog = None
    PublishingActivityLog = None
    ContentDraft = None

__all__ = [
    "Base",
    "User",
    "UserRoleEnum",
    "UserStatusEnum",
    "NotificationPreference",
    "DashboardStatistic",
    "SocialAccount",
    "PlatformEnum",
    "Campaign",
    "CampaignPlatformEnum",
    "CampaignStatusEnum",
    "Post",
    "PostTypeEnum",
    "PostStatusEnum",
    "PostMedia",
    "PostAnalytics",
    "PublishingQueue",
    "PublishingLog",
    "RecurringPostRule",
    "MediaMetadata",
    "RawAnalyticsLog",
    "PublishingActivityLog",
    "ContentDraft"
]
