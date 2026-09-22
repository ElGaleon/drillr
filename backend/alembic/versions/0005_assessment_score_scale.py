"""change assessment scores to a 1-10 half-point scale

Revision ID: 0005_assessment_score_scale
Revises: 0004_player_contact_and_availability
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_assessment_score_scale"
down_revision = "0004_player_contact_and_availability"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("player_skill_assessments") as batch:
        batch.alter_column("score", existing_type=sa.Integer(), type_=sa.Float(), existing_nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("player_skill_assessments") as batch:
        batch.alter_column("score", existing_type=sa.Float(), type_=sa.Integer(), existing_nullable=False)
