from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import Player


def list_players(db: Session, user: AuthenticatedUser, team_id: str, search: str | None, player_status: str | None) -> list[Player]:
    query = select(Player).where(Player.team_id == team_id, Player.owner_user_id == user.user_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.where((Player.first_name.ilike(term)) | (Player.last_name.ilike(term)))
    if player_status and player_status != "all":
        query = query.where(Player.status == player_status)
    return list(db.scalars(query.order_by(Player.last_name, Player.first_name)).all())


def get_player(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> Player | None:
    return db.scalar(select(Player).where(Player.id == player_id, Player.team_id == team_id, Player.owner_user_id == user.user_id))
