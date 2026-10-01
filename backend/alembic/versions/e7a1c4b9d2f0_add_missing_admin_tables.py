"""Add maintenance_windows and system_issues

These models existed without a migration, so a fresh database (e.g. in Docker) lacked
them and every farmer request failed on the maintenance check. Databases that already
have the tables are left alone.

Revision ID: e7a1c4b9d2f0
Revises: c3d9e2f4a1b7
Create Date: 2026-10-01 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7a1c4b9d2f0'
down_revision: Union[str, Sequence[str], None] = 'c3d9e2f4a1b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    existing = set(sa.inspect(op.get_bind()).get_table_names())
    if 'maintenance_windows' not in existing:
        op.create_table('maintenance_windows',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
        )
    if 'system_issues' not in existing:
        op.create_table('system_issues',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('open', 'in_progress', 'resolved', name='issuestatus'), nullable=True),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', name='issuepriority'), nullable=True),
        sa.Column('reporter_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('system_issues')
    op.drop_table('maintenance_windows')
    sa.Enum(name='issuepriority').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='issuestatus').drop(op.get_bind(), checkfirst=True)
