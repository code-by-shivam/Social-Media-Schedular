import enum
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime, Numeric, BigInteger,
    ForeignKey, Enum as SQLEnum, func
)
from sqlalchemy.orm import relationship
from app.core.postgres import Base
from sqlalchemy import LargeBinary

# Enums


class UserRoleEnum(str, enum.Enum):
    CONTENT_CREATOR = "Content Creator"
    MARKETING_TEAM = "Marketing Team"
    BUSINESS_USER = "Business User"
    ADMINISTRATOR = "Administrator"

class UserStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"

class PlatformEnum(str, enum.Enum):
    FACEBOOK = "Facebook"
    INSTAGRAM = "Instagram"
    LINKEDIN = "LinkedIn"
    TWITTER = "X(Twitter)"
    YOUTUBE = "YouTube"
    PINTEREST = "Pinterest"

class CampaignPlatformEnum(str, enum.Enum):
    FACEBOOK = "Facebook"
    INSTAGRAM = "Instagram"
    LINKEDIN = "LinkedIn"
    TWITTER = "X(Twitter)"
    YOUTUBE = "YouTube"
    PINTEREST = "Pinterest"
    ALL = "All"

class CampaignStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    PAUSED = "Paused"

class PostTypeEnum(str, enum.Enum):
    TEXT = "Text"
    IMAGE = "Image"
    VIDEO = "Video"
    CAROUSEL = "Carousel"
    STORY = "Story"
    REEL = "Reel"

class PostStatusEnum(str, enum.Enum):
    SCHEDULED = "Scheduled"
    PUBLISHED = "Published"
    FAILED = "Failed"
    CANCELLED = "Cancelled"
    PENDING_APPROVAL = "Pending Approval"
    DRAFT = "Draft"

class RecurringFrequencyEnum(str, enum.Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    YEARLY = "Yearly"

# Models
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)  # Team Lead feedback
    location = Column(String(100), nullable=True)  # Team Lead feedback
    role = Column(SQLEnum(UserRoleEnum), default=UserRoleEnum.CONTENT_CREATOR, nullable=False)
    profile_image = Column(String(255), nullable=True)
    timezone = Column(String(50), default="UTC")
    status = Column(SQLEnum(UserStatusEnum), default=UserStatusEnum.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dashboard_statistics = relationship("DashboardStatistic", back_populates="user", uselist=False, cascade="all, delete-orphan")
    social_accounts = relationship("SocialAccount", back_populates="user", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    email_notification = Column(Boolean, default=True)
    push_notification = Column(Boolean, default=True)
    campaign_alert = Column(Boolean, default=True)
    publishing_alert = Column(Boolean, default=True)
    post_reminder = Column(Boolean, default=True)
    team_alert = Column(Boolean, default=True)
    auto_sync = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    user = relationship("User", back_populates="notification_preferences")


class DashboardStatistic(Base):
    __tablename__ = "dashboard_statistics"

    dashboard_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    total_posts = Column(Integer, default=0)
    published_posts = Column(Integer, default=0)
    scheduled_posts = Column(Integer, default=0)
    failed_posts = Column(Integer, default=0)
    total_followers = Column(BigInteger, default=0)
    total_reach = Column(BigInteger, default=0)
    total_impressions = Column(BigInteger, default=0)
    total_engagement = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="dashboard_statistics")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    social_account_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="social_accounts")
    posts = relationship(
        "Post",
        back_populates="social_account",
        cascade="all, delete-orphan"
    )
    audience_growth = relationship(
        "AudienceGrowth",
        back_populates="social_account",
        cascade="all, delete-orphan"
    )
    platform_name = Column(SQLEnum(PlatformEnum), nullable=False)
    platform_user_id = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    access_token = Column(String(500), nullable=False)
    refresh_token = Column(String(500), nullable=True)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    permission_scope = Column(String(255), nullable=True)
    status = Column(SQLEnum(UserStatusEnum), default=UserStatusEnum.ACTIVE, nullable=False)
    connected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="social_accounts")
    posts = relationship("Post", back_populates="social_account", cascade="all, delete-orphan")


class Campaign(Base):
    __tablename__ = "campaigns"

    campaign_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="campaigns")
    posts = relationship("Post", back_populates="campaign")
    performance = relationship(
        "CampaignPerformance",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )
    roi_records = relationship(
        "CampaignROI",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )
    campaign_name = Column(String(100), nullable=False)
    objective = Column(String(255), nullable=True)
    budget = Column(Numeric(12, 2), nullable=True)
    platform = Column(SQLEnum(CampaignPlatformEnum), default=CampaignPlatformEnum.ALL, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(SQLEnum(CampaignStatusEnum), default=CampaignStatusEnum.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="campaigns")
    posts = relationship("Post", back_populates="campaign")


class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    social_account_id = Column(Integer, ForeignKey("social_accounts.social_account_id", ondelete="CASCADE"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.campaign_id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=True)
    caption = Column(Text, nullable=True)
    image_data = Column(LargeBinary, nullable=True)
    image_name = Column(String(255), nullable=True)
    image_type = Column(String(100), nullable=True)  # Primary / legacy single media URL
    post_type = Column(SQLEnum(PostTypeEnum), default=PostTypeEnum.TEXT, nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    published_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(PostStatusEnum), default=PostStatusEnum.DRAFT, nullable=False)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="posts")
    social_account = relationship("SocialAccount", back_populates="posts")
    campaign = relationship("Campaign", back_populates="posts")
    post_media = relationship("PostMedia", back_populates="post", cascade="all, delete-orphan")
    analytics = relationship("PostAnalytics", back_populates="post", cascade="all, delete-orphan")
    publishing_queue = relationship("PublishingQueue", back_populates="post", cascade="all, delete-orphan")
    publishing_logs = relationship("PublishingLog", back_populates="post", cascade="all, delete-orphan")
    recurring_rules = relationship("RecurringPostRule", back_populates="post", cascade="all, delete-orphan")


class PostMedia(Base):  # Team Lead feedback: Separate post_media table for multiple media files
    __tablename__ = "post_media"

    post_media_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(50), default="Image", nullable=False)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", back_populates="post_media")


class PostAnalytics(Base):  # Supports historical records over time
    __tablename__ = "post_analytics"

    analytics_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    reach = Column(BigInteger, default=0)
    impressions = Column(BigInteger, default=0)
    saves = Column(Integer, default=0)
    engagement_rate = Column(Numeric(5, 2), default=0.0)
    video_views = Column(BigInteger, default=0)
    followers_gained = Column(Integer, default=0)
    record_date = Column(Date, server_default=func.current_date(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", back_populates="analytics")


class PublishingQueue(Base):
    __tablename__ = "publishing_queue"

    queue_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    priority = Column(Integer, default=1)
    attempts = Column(Integer, default=0)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="QUEUED", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", back_populates="publishing_queue")


class PublishingLog(Base):
    __tablename__ = "publishing_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    error_code = Column(String(100), nullable=True)
    platform_response = Column(Text, nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", back_populates="publishing_logs")


class RecurringPostRule(Base):
    __tablename__ = "recurring_post_rules"

    rule_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    frequency = Column(String(50), nullable=False)
    cron_expression = Column(String(100), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", back_populates="recurring_rules")


class CampaignPerformance(Base):
    __tablename__ = "campaign_performance"

    performance_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.campaign_id", ondelete="CASCADE"),
        nullable=False
    )

    platform = Column(
        SQLEnum(CampaignPlatformEnum),
        nullable=False
    )

    impressions = Column(BigInteger, default=0, nullable=False)
    reach = Column(BigInteger, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)
    shares = Column(Integer, default=0, nullable=False)
    clicks = Column(Integer, default=0, nullable=False)
    saves = Column(Integer, default=0, nullable=False)
    video_views = Column(BigInteger, default=0, nullable=False)

    engagement_rate = Column(
        Numeric(8, 2),
        default=0,
        nullable=False
    )

    conversions = Column(Integer, default=0, nullable=False)

    record_date = Column(
        Date,
        server_default=func.current_date(),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    campaign = relationship(
        "Campaign",
        back_populates="performance"
    )


class AudienceGrowth(Base):
    __tablename__ = "audience_growth"

    audience_growth_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    social_account_id = Column(
        Integer,
        ForeignKey(
            "social_accounts.social_account_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    record_date = Column(
        Date,
        server_default=func.current_date(),
        nullable=False
    )

    followers_count = Column(
        BigInteger,
        default=0,
        nullable=False
    )

    followers_gained = Column(
        Integer,
        default=0,
        nullable=False
    )

    followers_lost = Column(
        Integer,
        default=0,
        nullable=False
    )

    net_growth = Column(
        Integer,
        default=0,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    social_account = relationship(
        "SocialAccount",
        back_populates="audience_growth"
    )


class CampaignROI(Base):
    __tablename__ = "campaign_roi"

    roi_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    campaign_id = Column(
        Integer,
        ForeignKey(
            "campaigns.campaign_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    total_spend = Column(
        Numeric(12, 2),
        default=0,
        nullable=False
    )

    revenue = Column(
        Numeric(12, 2),
        default=0,
        nullable=False
    )

    conversions = Column(
        Integer,
        default=0,
        nullable=False
    )

    cost_per_conversion = Column(
        Numeric(12, 2),
        default=0,
        nullable=False
    )

    roi_percentage = Column(
        Numeric(8, 2),
        default=0,
        nullable=False
    )

    record_date = Column(
        Date,
        server_default=func.current_date(),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    campaign = relationship(
        "Campaign",
        back_populates="roi_records"
    )


