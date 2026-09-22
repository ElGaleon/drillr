from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..enums import RoleType
from ..models import RoleDefinition

DEFAULT_ROLES = (
    (RoleType.PRIMARY, "Handler"),
    (RoleType.PRIMARY, "Middle"),
    (RoleType.PRIMARY, "Deep"),
    (RoleType.ZONE_DEFENSE, "Nocciolina"),
    (RoleType.ZONE_DEFENSE, "Cacciavite"),
    (RoleType.ZONE_DEFENSE, "Trapano"),
    (RoleType.ZONE_DEFENSE, "Seconda"),
    (RoleType.ZONE_DEFENSE, "Ultimo"),
)


def ensure_default_roles(db: Session, user: AuthenticatedUser, team_id: str) -> None:
    existing_types = set(db.scalars(select(RoleDefinition.role_type).where(RoleDefinition.owner_user_id == user.user_id, RoleDefinition.team_id == team_id)).all())
    next_sort_order = {role_type: 1 for role_type, _ in DEFAULT_ROLES}
    for role_type, name in DEFAULT_ROLES:
        if role_type.value not in existing_types:
            db.add(RoleDefinition(owner_user_id=user.user_id, team_id=team_id, role_type=role_type.value, name=name, sort_order=next_sort_order[role_type]))
            next_sort_order[role_type] += 1
    if not existing_types or any(role_type.value not in existing_types for role_type, _ in DEFAULT_ROLES):
        db.commit()
