from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import PlayerSkillAssessment
from ..repositories.skills import list_player_assessments, list_skills
from ..schemas import AssessmentHistoryRead, PlayerSkillsRead, SkillScoreRead


def player_skill_snapshot(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> PlayerSkillsRead:
    skills = list_skills(db, user, team_id)
    history_rows = list_player_assessments(db, user, team_id, player_id)
    latest_by_skill: dict[str, PlayerSkillAssessment] = {}
    for row in history_rows:
        latest_by_skill.setdefault(row.skill_id, row)
    current = [
        SkillScoreRead(
            skill_id=skill.id,
            skill_name=skill.name,
            category=skill.category,
            score=latest_by_skill[skill.id].score if skill.id in latest_by_skill else None,
            source=latest_by_skill[skill.id].source if skill.id in latest_by_skill else None,
            note=latest_by_skill[skill.id].note if skill.id in latest_by_skill else None,
            recorded_at=latest_by_skill[skill.id].recorded_at if skill.id in latest_by_skill else None,
        )
        for skill in skills
        if skill.is_active
    ]
    history = [
        AssessmentHistoryRead(
            id=row.id,
            skill_id=row.skill_id,
            skill_name=row.skill.name,
            category=row.skill.category,
            score=row.score,
            source=row.source,
            note=row.note,
            recorded_at=row.recorded_at,
        )
        for row in history_rows
    ]
    return PlayerSkillsRead(skills=skills, current=current, history=history)
