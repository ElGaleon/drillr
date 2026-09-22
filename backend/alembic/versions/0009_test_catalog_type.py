"""add test catalog type

Revision ID: 0009_test_catalog_type
Revises: 0008_development_history
"""

from alembic import op
import sqlalchemy as sa


revision = "0009_test_catalog_type"
down_revision = "0008_development_history"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("athletic_test_definitions", sa.Column("test_type", sa.String(length=20), nullable=False, server_default="athletic"))


def downgrade() -> None:
    op.drop_column("athletic_test_definitions", "test_type")
