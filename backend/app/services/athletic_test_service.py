from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..enums import AthleticTestDirection
from ..models import AthleticTestDefinition

DEFAULT_TESTS = (
    ("10m sprint", "Speed", "s", AthleticTestDirection.LOWER_IS_BETTER),
    ("Countermovement jump", "Power", "cm", AthleticTestDirection.HIGHER_IS_BETTER),
    ("Yo-Yo IR1", "Endurance", "level", AthleticTestDirection.HIGHER_IS_BETTER),
    ("Standing broad jump", "Power", "cm", AthleticTestDirection.HIGHER_IS_BETTER),
)


def ensure_default_test_definitions(db: Session, user: AuthenticatedUser, team_id: str) -> None:
    exists = db.scalar(select(AthleticTestDefinition.id).where(AthleticTestDefinition.owner_user_id == user.user_id, AthleticTestDefinition.team_id == team_id))
    if exists:
        return
    for sort_order, (name, category, unit, direction) in enumerate(DEFAULT_TESTS, start=1):
        db.add(AthleticTestDefinition(owner_user_id=user.user_id, team_id=team_id, name=name, category=category, unit=unit, direction=direction.value, sort_order=sort_order))
    db.commit()
