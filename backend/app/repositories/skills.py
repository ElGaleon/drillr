from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import PlayerSkillAssessment, SkillDefinition


def list_skills(db: Session, user: AuthenticatedUser, team_id: str) -> list[SkillDefinition]:
    return list(db.scalars(select(SkillDefinition).where(SkillDefinition.owner_user_id == user.user_id, SkillDefinition.team_id == team_id).order_by(SkillDefinition.sort_order, SkillDefinition.created_at)).all())


def get_skill(db: Session, user: AuthenticatedUser, team_id: str, skill_id: str) -> SkillDefinition | None:
    return db.scalar(select(SkillDefinition).where(SkillDefinition.id == skill_id, SkillDefinition.team_id == team_id, SkillDefinition.owner_user_id == user.user_id))


def list_player_assessments(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> list[PlayerSkillAssessment]:
    return list(db.scalars(select(PlayerSkillAssessment).where(PlayerSkillAssessment.owner_user_id == user.user_id, PlayerSkillAssessment.team_id == team_id, PlayerSkillAssessment.player_id == player_id).order_by(PlayerSkillAssessment.recorded_at.desc())).all())
