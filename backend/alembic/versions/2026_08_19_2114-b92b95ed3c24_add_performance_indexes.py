"""add performance indexes

Revision ID: b92b95ed3c24
Revises: e936b53d1c9d
Create Date: 2026-08-19 21:14:14.186878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b92b95ed3c24'
down_revision: Union[str, Sequence[str], None] = 'e936b53d1c9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add indexes for frequently used query/filter columns."""

    op.create_index(
        "ix_social_accounts_user_id",
        "social_accounts",
        ["user_id"]
    )

    op.create_index(
        "ix_campaigns_user_id",
        "campaigns",
        ["user_id"]
    )

    op.create_index(
        "ix_posts_user_id",
        "posts",
        ["user_id"]
    )

    op.create_index(
        "ix_posts_campaign_id",
        "posts",
        ["campaign_id"]
    )

    op.create_index(
        "ix_posts_social_account_id",
        "posts",
        ["social_account_id"]
    )

    op.create_index(
        "ix_post_media_post_id",
        "post_media",
        ["post_id"]
    )

    op.create_index(
        "ix_post_analytics_post_id",
        "post_analytics",
        ["post_id"]
    )

    op.create_index(
        "ix_publishing_queue_post_id",
        "publishing_queue",
        ["post_id"]
    )

    op.create_index(
        "ix_publishing_queue_status_scheduled_at",
        "publishing_queue",
        ["status", "scheduled_at"]
    )

    op.create_index(
        "ix_publishing_logs_post_id",
        "publishing_logs",
        ["post_id"]
    )

    op.create_index(
        "ix_recurring_post_rules_post_id",
        "recurring_post_rules",
        ["post_id"]
    )

    op.create_index(
        "ix_campaign_performance_campaign_id",
        "campaign_performance",
        ["campaign_id"]
    )

    op.create_index(
        "ix_audience_growth_social_account_id",
        "audience_growth",
        ["social_account_id"]
    )

    op.create_index(
        "ix_campaign_roi_campaign_id",
        "campaign_roi",
        ["campaign_id"]
    )


def downgrade() -> None:
    """Remove performance indexes."""

    op.drop_index(
        "ix_campaign_roi_campaign_id",
        table_name="campaign_roi"
    )

    op.drop_index(
        "ix_audience_growth_social_account_id",
        table_name="audience_growth"
    )

    op.drop_index(
        "ix_campaign_performance_campaign_id",
        table_name="campaign_performance"
    )

    op.drop_index(
        "ix_recurring_post_rules_post_id",
        table_name="recurring_post_rules"
    )

    op.drop_index(
        "ix_publishing_logs_post_id",
        table_name="publishing_logs"
    )

    op.drop_index(
        "ix_publishing_queue_status_scheduled_at",
        table_name="publishing_queue"
    )

    op.drop_index(
        "ix_publishing_queue_post_id",
        table_name="publishing_queue"
    )

    op.drop_index(
        "ix_post_analytics_post_id",
        table_name="post_analytics"
    )

    op.drop_index(
        "ix_post_media_post_id",
        table_name="post_media"
    )

    op.drop_index(
        "ix_posts_social_account_id",
        table_name="posts"
    )

    op.drop_index(
        "ix_posts_campaign_id",
        table_name="posts"
    )

    op.drop_index(
        "ix_posts_user_id",
        table_name="posts"
    )

    op.drop_index(
        "ix_campaigns_user_id",
        table_name="campaigns"
    )

    op.drop_index(
        "ix_social_accounts_user_id",
        table_name="social_accounts"
    )