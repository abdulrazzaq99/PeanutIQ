"""Add analysis (Gemini result) to scan_reports

Revision ID: a9c3e5f7b2d4
Revises: f2b8d6a3c9e1
Create Date: 2026-10-03 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9c3e5f7b2d4'
down_revision: Union[str, Sequence[str], None] = 'f2b8d6a3c9e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('scan_reports', sa.Column('analysis', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('scan_reports', 'analysis')
