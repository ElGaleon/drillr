import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import Player, SkillDefinition, Team
from ..repositories.teams import player_count
from ..schemas import TeamRead

DEFAULT_SKILLS = (
    ("Disc skills", "attack", "Technical control and execution with the disc."),
    ("Movement & spacing", "attack", "Off-ball movement, timing, and use of space."),
    ("Decision making", "attack", "Quality and speed of choices under pressure."),
    ("Man marking", "defense", "Ability to track and contain an assigned opponent."),
    ("Zone marking", "defense", "Ability to protect space and coordinate defensive coverage."),
    ("Game reading", "defense", "Anticipation, scanning, and understanding of play."),
)


def read_team(db: Session, team: Team) -> TeamRead:
    return TeamRead.model_validate(team).model_copy(update={"player_count": player_count(db, team)})


def ensure_default_skills(db: Session, user: AuthenticatedUser, team_id: str) -> None:
    existing = set(db.scalars(select(SkillDefinition.name).where(SkillDefinition.owner_user_id == user.user_id, SkillDefinition.team_id == team_id)).all())
    for index, (name, category, description) in enumerate(DEFAULT_SKILLS, start=1):
        if name not in existing:
            db.add(SkillDefinition(owner_user_id=user.user_id, team_id=team_id, name=name, category=category, description=description, sort_order=index))
    db.commit()


def seed_demo_data(db: Session, user: AuthenticatedUser) -> None:
    if os.getenv("DEV_AUTH_BYPASS", "false").lower() != "true" or db.scalar(select(Team).where(Team.owner_user_id == user.user_id)):
        return
    team = Team(owner_user_id=user.user_id, name="First team", season="2025/26", accent="orange")
    db.add(team)
    db.flush()
    for first_name, last_name, role, status_value in [("Luca", "Bianchi", "Handler", "active"), ("Marco", "Rossi", "Middle", "active"), ("Andrea", "Conti", "Deep", "injured"), ("Davide", "Esposito", "Handler", "active")]:
        db.add(Player(owner_user_id=user.user_id, team_id=team.id, first_name=first_name, last_name=last_name, primary_role=role, status=status_value))
    for index, (name, category, description) in enumerate(DEFAULT_SKILLS, start=1):
        db.add(SkillDefinition(owner_user_id=user.user_id, team_id=team.id, name=name, category=category, description=description, sort_order=index))
    db.commit()
