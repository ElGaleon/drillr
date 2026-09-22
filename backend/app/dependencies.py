from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from .auth import AuthenticatedUser
from .models import Player, Team
from .repositories.players import get_player
from .repositories.teams import get_team


def require_team(db: Session, user: AuthenticatedUser, team_id: str) -> Team:
    team = get_team(db, user, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


def require_player(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> Player:
    require_team(db, user, team_id)
    player = get_player(db, user, team_id, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    return player
