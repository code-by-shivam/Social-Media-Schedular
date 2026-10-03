"""add milestone 3 campaign analytics

Revision ID: e936b53d1c9d
Revises: 74c91cd36bb8
Create Date: 2026-08-13 11:40:28.362293

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "e936b53d1c9d"
down_revision: Union[str, Sequence[str], None] = "74c91cd36bb8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create Milestone 3 campaign analytics tables."""

    bind = op.get_bind()
    inspector = inspect(bind)

    existing_tables = inspector.get_table_names()

    # Campaign Performance
    if "campaign_performance" not in existing_tables:

        op.create_table(
            "campaign_performance",

            sa.Column(
                "performance_id",
                sa.Integer(),
                autoincrement=True,
                nullable=False
            ),

            sa.Column(
                "campaign_id",
                sa.Integer(),
                nullable=False
            ),

            sa.Column(
                "platform",
                sa.Enum(
                    "FACEBOOK",
                    "INSTAGRAM",
                    "LINKEDIN",
                    "TWITTER",
                    "YOUTUBE",
                    "PINTEREST",
                    name="campaignplatformenum",
                    create_type=False
                ),
                nullable=False
            ),

            sa.Column(
                "impressions",
                sa.BigInteger(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "reach",
                sa.BigInteger(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "likes",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "comments",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "shares",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "clicks",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "saves",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "video_views",
                sa.BigInteger(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "engagement_rate",
                sa.Numeric(8, 2),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "conversions",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "record_date",
                sa.Date(),
                nullable=False,
                server_default=sa.text("CURRENT_DATE")
            ),

            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.ForeignKeyConstraint(
                ["campaign_id"],
                ["campaigns.campaign_id"],
                ondelete="CASCADE"
            ),

            sa.PrimaryKeyConstraint("performance_id")
        )

    # Audience Growth
    if "audience_growth" not in existing_tables:

        op.create_table(
            "audience_growth",

            sa.Column(
                "audience_growth_id",
                sa.Integer(),
                autoincrement=True,
                nullable=False
            ),

            sa.Column(
                "social_account_id",
                sa.Integer(),
                nullable=False
            ),

            sa.Column(
                "record_date",
                sa.Date(),
                nullable=False,
                server_default=sa.text("CURRENT_DATE")
            ),

            sa.Column(
                "followers_count",
                sa.BigInteger(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "followers_gained",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "followers_lost",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "net_growth",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.ForeignKeyConstraint(
                ["social_account_id"],
                ["social_accounts.social_account_id"],
                ondelete="CASCADE"
            ),

            sa.PrimaryKeyConstraint("audience_growth_id")
        )

    # Campaign ROI
    if "campaign_roi" not in existing_tables:

        op.create_table(
            "campaign_roi",

            sa.Column(
                "roi_id",
                sa.Integer(),
                autoincrement=True,
                nullable=False
            ),

            sa.Column(
                "campaign_id",
                sa.Integer(),
                nullable=False
            ),

            sa.Column(
                "total_spend",
                sa.Numeric(12, 2),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "revenue",
                sa.Numeric(12, 2),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "conversions",
                sa.Integer(),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "cost_per_conversion",
                sa.Numeric(12, 2),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "roi_percentage",
                sa.Numeric(8, 2),
                nullable=False,
                server_default="0"
            ),

            sa.Column(
                "record_date",
                sa.Date(),
                nullable=False,
                server_default=sa.text("CURRENT_DATE")
            ),

            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()")
            ),

            sa.ForeignKeyConstraint(
                ["campaign_id"],
                ["campaigns.campaign_id"],
                ondelete="CASCADE"
            ),

            sa.PrimaryKeyConstraint("roi_id")
        )


def downgrade() -> None:
    """Remove Milestone 3 campaign analytics tables."""

    bind = op.get_bind()
    inspector = inspect(bind)

    existing_tables = inspector.get_table_names()

    if "campaign_roi" in existing_tables:
        op.drop_table("campaign_roi")

    if "audience_growth" in existing_tables:
        op.drop_table("audience_growth")

    if "campaign_performance" in existing_tables:
        op.drop_table("campaign_performance")