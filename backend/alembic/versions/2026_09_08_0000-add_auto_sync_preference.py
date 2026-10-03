"""add auto sync preference

Revision ID: 9f6d1c2a4b7e
Revises: e936b53d1c9d
Create Date: 2026-09-08 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f6d1c2a4b7e"
down_revision: Union[str, Sequence[str], None] = "e936b53d1c9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "notification_preferences",
        sa.Column("auto_sync", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("notification_preferences", "auto_sync")
