"""add configurable skills and append-only player assessments

Revision ID: 0002_skill_framework
Revises: 0001_initial
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_skill_framework"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "skill_definitions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_skill_definitions_owner_team", "skill_definitions", ["owner_user_id", "team_id"])
    op.create_index("ix_skill_definitions_team_active", "skill_definitions", ["team_id", "is_active"])
    op.create_table(
        "player_skill_assessments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("player_id", sa.String(length=36), nullable=False),
        sa.Column("skill_id", sa.String(length=36), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["skill_id"], ["skill_definitions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_player_skill_assessments_owner_team_player", "player_skill_assessments", ["owner_user_id", "team_id", "player_id"])
    op.create_index("ix_player_skill_assessments_player_skill_recorded", "player_skill_assessments", ["player_id", "skill_id", "recorded_at"])


def downgrade() -> None:
    op.drop_index("ix_player_skill_assessments_player_skill_recorded", table_name="player_skill_assessments")
    op.drop_index("ix_player_skill_assessments_owner_team_player", table_name="player_skill_assessments")
    op.drop_table("player_skill_assessments")
    op.drop_index("ix_skill_definitions_team_active", table_name="skill_definitions")
    op.drop_index("ix_skill_definitions_owner_team", table_name="skill_definitions")
    op.drop_table("skill_definitions")
