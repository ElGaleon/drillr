from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_team
from ..models import Player
from ..schemas import DashboardRead
from ..services.team_service import read_team

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardRead)
def get_dashboard(team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    team = require_team(db, user, team_id)
    players = list(db.scalars(select(Player).where(Player.team_id == team_id, Player.owner_user_id == user.user_id).order_by(Player.created_at.desc())).all())
    counts = {status_value: sum(player.status == status_value for player in players) for status_value in ("active", "injured", "inactive")}
    return DashboardRead(team=read_team(db, team), total_players=len(players), active_players=counts["active"], injured_players=counts["injured"], inactive_players=counts["inactive"], recent_players=players[:5])
