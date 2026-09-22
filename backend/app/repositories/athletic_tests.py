from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..auth import AuthenticatedUser
from ..models import AthleticTestDefinition, AthleticTestResult, Player


def list_test_definitions(db: Session, user: AuthenticatedUser, team_id: str) -> list[AthleticTestDefinition]:
    query = select(AthleticTestDefinition).where(AthleticTestDefinition.owner_user_id == user.user_id, AthleticTestDefinition.team_id == team_id).order_by(AthleticTestDefinition.sort_order, AthleticTestDefinition.created_at)
    return list(db.scalars(query).all())


def get_test_definition(db: Session, user: AuthenticatedUser, team_id: str, test_id: str) -> AthleticTestDefinition | None:
    return db.scalar(select(AthleticTestDefinition).where(AthleticTestDefinition.id == test_id, AthleticTestDefinition.owner_user_id == user.user_id, AthleticTestDefinition.team_id == team_id))


def list_player_results(db: Session, user: AuthenticatedUser, team_id: str, player_id: str) -> list[AthleticTestResult]:
    query = select(AthleticTestResult).options(joinedload(AthleticTestResult.test)).where(AthleticTestResult.owner_user_id == user.user_id, AthleticTestResult.team_id == team_id, AthleticTestResult.player_id == player_id).order_by(AthleticTestResult.recorded_at.desc())
    return list(db.scalars(query).all())


def list_team_results(db: Session, user: AuthenticatedUser, team_id: str, player_id: str | None = None, test_id: str | None = None, category: str | None = None) -> list[tuple[AthleticTestResult, Player]]:
    query = (
        select(AthleticTestResult, Player)
        .join(Player, Player.id == AthleticTestResult.player_id)
        .options(joinedload(AthleticTestResult.test))
        .where(AthleticTestResult.owner_user_id == user.user_id, AthleticTestResult.team_id == team_id, Player.owner_user_id == user.user_id, Player.team_id == team_id)
        .order_by(AthleticTestResult.recorded_at.desc())
    )
    if player_id:
        query = query.where(AthleticTestResult.player_id == player_id)
    if test_id:
        query = query.where(AthleticTestResult.test_id == test_id)
    if category:
        query = query.join(AthleticTestDefinition, AthleticTestDefinition.id == AthleticTestResult.test_id).where(AthleticTestDefinition.category == category)
    return list(db.execute(query).all())
