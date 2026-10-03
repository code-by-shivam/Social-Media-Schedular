"""merge performance indexes and auto sync heads

Revision ID: 79d94e8fe981
Revises: b92b95ed3c24, 9f6d1c2a4b7e
Create Date: 2026-09-09 11:03:52.029248

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79d94e8fe981'
down_revision: Union[str, Sequence[str], None] = ('b92b95ed3c24', '9f6d1c2a4b7e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
