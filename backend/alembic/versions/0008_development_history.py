"""add athletic tests and player reviews

Revision ID: 0008_development_history
Revises: 0007_role_definitions
"""

from alembic import op
import sqlalchemy as sa


revision = "0008_development_history"
down_revision = "0007_role_definitions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "athletic_test_definitions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("direction", sa.String(length=30), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_athletic_test_definitions_owner_team", "athletic_test_definitions", ["owner_user_id", "team_id"])
    op.create_index("ix_athletic_test_definitions_team_active", "athletic_test_definitions", ["team_id", "is_active"])

    op.create_table(
        "athletic_test_results",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("player_id", sa.String(length=36), nullable=False),
        sa.Column("test_id", sa.String(length=36), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["test_id"], ["athletic_test_definitions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_athletic_test_results_owner_team_player", "athletic_test_results", ["owner_user_id", "team_id", "player_id"])
    op.create_index("ix_athletic_test_results_player_test_recorded", "athletic_test_results", ["player_id", "test_id", "recorded_at"])

    op.create_table(
        "player_reviews",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_user_id", sa.String(length=255), nullable=False),
        sa.Column("team_id", sa.String(length=36), nullable=False),
        sa.Column("player_id", sa.String(length=36), nullable=False),
        sa.Column("review_date", sa.Date(), nullable=False),
        sa.Column("strengths", sa.Text(), nullable=True),
        sa.Column("next_steps", sa.Text(), nullable=True),
        sa.Column("development_path", sa.Text(), nullable=True),
        sa.Column("coach_notes", sa.Text(), nullable=True),
        sa.Column("visibility", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_player_reviews_owner_team_player", "player_reviews", ["owner_user_id", "team_id", "player_id"])


def downgrade() -> None:
    op.drop_index("ix_player_reviews_owner_team_player", table_name="player_reviews")
    op.drop_table("player_reviews")
    op.drop_index("ix_athletic_test_results_player_test_recorded", table_name="athletic_test_results")
    op.drop_index("ix_athletic_test_results_owner_team_player", table_name="athletic_test_results")
    op.drop_table("athletic_test_results")
    op.drop_index("ix_athletic_test_definitions_team_active", table_name="athletic_test_definitions")
    op.drop_index("ix_athletic_test_definitions_owner_team", table_name="athletic_test_definitions")
    op.drop_table("athletic_test_definitions")
