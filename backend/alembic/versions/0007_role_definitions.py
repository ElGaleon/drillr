"""add configurable player roles

Revision ID: 0007_role_definitions
Revises: 0006_player_goals
"""

from alembic import op
import sqlalchemy as sa


revision = "0007_role_definitions"
down_revision = "0006_player_goals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "role_definitions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("role_type", sa.String(length=30), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_role_definitions_owner_team", "role_definitions", ["owner_user_id", "team_id"])
    op.create_index("ix_role_definitions_team_type_active", "role_definitions", ["team_id", "role_type", "is_active"])


def downgrade() -> None:
    op.drop_index("ix_role_definitions_team_type_active", table_name="role_definitions")
    op.drop_index("ix_role_definitions_owner_team", table_name="role_definitions")
    op.drop_table("role_definitions")
