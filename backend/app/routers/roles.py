from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_team
from ..models import RoleDefinition
from ..repositories.roles import get_role, list_roles
from ..schemas import RoleCreate, RoleRead, RoleUpdate
from ..services.role_service import ensure_default_roles

router = APIRouter(prefix="/api/v1/roles", tags=["roles"])


@router.get("", response_model=list[RoleRead])
def get_roles(team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    ensure_default_roles(db, user, team_id)
    return list_roles(db, user, team_id)


@router.post("", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role(team_id: str = Query(min_length=1), payload: RoleCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    role = RoleDefinition(owner_user_id=user.user_id, team_id=team_id, **payload.model_dump())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.patch("/{role_id}", response_model=RoleRead)
def update_role(role_id: str, team_id: str = Query(min_length=1), payload: RoleUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    role = get_role(db, user, team_id, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(role, field, value)
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", response_model=RoleRead)
def archive_role(role_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    role = get_role(db, user, team_id, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    role.is_active = False
    db.commit()
    db.refresh(role)
    return role
