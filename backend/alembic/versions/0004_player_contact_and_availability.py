"""add contact, availability, medical, and photo fields to players

Revision ID: 0004_player_contact_and_availability
Revises: 0003_player_profile
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_player_contact_and_availability"
down_revision = "0003_player_profile"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("players", sa.Column("nationality", sa.String(length=80), nullable=True))
    op.add_column("players", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("players", sa.Column("phone", sa.String(length=40), nullable=True))
    op.add_column("players", sa.Column("photo_url", sa.String(length=500), nullable=True))
    op.add_column("players", sa.Column("availability", sa.String(length=20), nullable=True))
    op.add_column("players", sa.Column("medical_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("players", "medical_notes")
    op.drop_column("players", "availability")
    op.drop_column("players", "photo_url")
    op.drop_column("players", "phone")
    op.drop_column("players", "email")
    op.drop_column("players", "nationality")
