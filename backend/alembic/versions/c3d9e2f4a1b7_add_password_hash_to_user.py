"""Add password_hash to user

Revision ID: c3d9e2f4a1b7
Revises: 401a68250d59
Create Date: 2026-10-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d9e2f4a1b7'
down_revision: Union[str, Sequence[str], None] = '401a68250d59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('password_hash', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'password_hash')
