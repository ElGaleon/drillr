"""extend players with personal and sport profile data

Revision ID: 0003_player_profile
Revises: 0002_skill_framework
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_player_profile"
down_revision = "0002_skill_framework"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("players", sa.Column("preferred_name", sa.String(length=80), nullable=True))
    op.add_column("players", sa.Column("gender", sa.String(length=30), nullable=True))
    op.add_column("players", sa.Column("dominant_hand", sa.String(length=20), nullable=True))
    op.add_column("players", sa.Column("secondary_role", sa.String(length=80), nullable=True))
    op.add_column("players", sa.Column("jersey_number", sa.Integer(), nullable=True))
    op.add_column("players", sa.Column("height_cm", sa.Integer(), nullable=True))
    op.add_column("players", sa.Column("weight_kg", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("players", "weight_kg")
    op.drop_column("players", "height_cm")
    op.drop_column("players", "jersey_number")
    op.drop_column("players", "secondary_role")
    op.drop_column("players", "dominant_hand")
    op.drop_column("players", "gender")
    op.drop_column("players", "preferred_name")
