from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..auth import AuthenticatedUser
from ..models import PlayerGoal


def list_player_goals(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> list[PlayerGoal]:
    query = (
        select(PlayerGoal)
        .options(joinedload(PlayerGoal.skill))
        .where(
            PlayerGoal.owner_user_id == user.user_id,
            PlayerGoal.team_id == team_id,
            PlayerGoal.player_id == player_id,
            PlayerGoal.status == "active",
        )
        .order_by(PlayerGoal.due_date.is_(None), PlayerGoal.due_date, PlayerGoal.created_at.desc())
    )
    return list(db.scalars(query).all())

