from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import Player, Team


def get_team(db: Session, user: AuthenticatedUser, team_id: str) -> Team | None:
    return db.scalar(select(Team).where(Team.id == team_id, Team.owner_user_id == user.user_id))


def list_teams(db: Session, user: AuthenticatedUser) -> list[Team]:
    return list(db.scalars(select(Team).where(Team.owner_user_id == user.user_id).order_by(Team.created_at)).all())


def player_count(db: Session, team: Team) -> int:
    return db.scalar(select(func.count(Player.id)).where(Player.team_id == team.id, Player.owner_user_id == team.owner_user_id)) or 0
