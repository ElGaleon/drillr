from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import Player, PlayerReview


def list_player_reviews(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> list[PlayerReview]:
    query = (
        select(PlayerReview)
        .where(
            PlayerReview.owner_user_id == user.user_id,
            PlayerReview.team_id == team_id,
            PlayerReview.player_id == player_id,
        )
        .order_by(PlayerReview.review_date.desc(), PlayerReview.created_at.desc())
    )
    return list(db.scalars(query).all())


def get_player_review(db: Session, user: AuthenticatedUser, team_id: str, player_id: str, review_id: str) -> PlayerReview | None:
    return db.scalar(
        select(PlayerReview).where(
            PlayerReview.id == review_id,
            PlayerReview.owner_user_id == user.user_id,
            PlayerReview.team_id == team_id,
            PlayerReview.player_id == player_id,
        )
    )


def list_team_reviews(db: Session, user: AuthenticatedUser, team_id: str, player_id: str | None = None, review_status: str | None = None, visibility: str | None = None) -> list[tuple[PlayerReview, Player]]:
    query = (
        select(PlayerReview, Player)
        .join(Player, Player.id == PlayerReview.player_id)
        .where(PlayerReview.owner_user_id == user.user_id, PlayerReview.team_id == team_id, Player.owner_user_id == user.user_id, Player.team_id == team_id)
        .order_by(PlayerReview.review_date.desc(), PlayerReview.created_at.desc())
    )
    if player_id:
        query = query.where(PlayerReview.player_id == player_id)
    if review_status:
        query = query.where(PlayerReview.status == review_status)
    if visibility:
        query = query.where(PlayerReview.visibility == visibility)
    return list(db.execute(query).all())
