from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..repositories.teams import list_teams
from ..schemas import TeamCreate, TeamRead, TeamUpdate
from ..services.team_service import ensure_default_skills, read_team, seed_demo_data
from ..dependencies import require_team

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
def get_teams(db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    seed_demo_data(db, user)
    return [read_team(db, team) for team in list_teams(db, user)]


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    from ..models import Team

    team = Team(owner_user_id=user.user_id, **payload.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    ensure_default_skills(db, user, team.id)
    return read_team(db, team)


@router.patch("/{team_id}", response_model=TeamRead)
def update_team(team_id: str, payload: TeamUpdate, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    team = require_team(db, user, team_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    return read_team(db, team)
