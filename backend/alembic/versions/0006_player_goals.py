"""add player goals

Revision ID: 0006_player_goals
Revises: 0005_assessment_score_scale
"""

from alembic import op
import sqlalchemy as sa


revision = "0006_player_goals"
down_revision = "0005_assessment_score_scale"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "player_goals",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("player_id", sa.String(length=36), nullable=False),
        sa.Column("skill_id", sa.String(length=36), nullable=True),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("target_score", sa.Float(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["skill_id"], ["skill_definitions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_player_goals_owner_team_player", "player_goals", ["owner_user_id", "team_id", "player_id"])


def downgrade() -> None:
    op.drop_index("ix_player_goals_owner_team_player", table_name="player_goals")
    op.drop_table("player_goals")

