from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser
from ..models import RoleDefinition


def list_roles(db: Session, user: AuthenticatedUser, team_id: str) -> list[RoleDefinition]:
    return list(db.scalars(select(RoleDefinition).where(RoleDefinition.owner_user_id == user.user_id, RoleDefinition.team_id == team_id).order_by(RoleDefinition.role_type, RoleDefinition.sort_order, RoleDefinition.created_at)).all())


def get_role(db: Session, user: AuthenticatedUser, team_id: str, role_id: str) -> RoleDefinition | None:
    return db.scalar(select(RoleDefinition).where(RoleDefinition.id == role_id, RoleDefinition.owner_user_id == user.user_id, RoleDefinition.team_id == team_id))
