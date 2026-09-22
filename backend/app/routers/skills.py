from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_team
from ..models import SkillDefinition
from ..repositories.skills import get_skill, list_skills
from ..schemas import SkillCreate, SkillRead, SkillUpdate
from ..services.team_service import ensure_default_skills

router = APIRouter(prefix="/api/v1/skills", tags=["skills"])


@router.get("", response_model=list[SkillRead])
def get_skills(team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    ensure_default_skills(db, user, team_id)
    return list_skills(db, user, team_id)


@router.post("", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill(team_id: str = Query(min_length=1), payload: SkillCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    skill = SkillDefinition(owner_user_id=user.user_id, team_id=team_id, **payload.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.patch("/{skill_id}", response_model=SkillRead)
def update_skill(skill_id: str, team_id: str = Query(min_length=1), payload: SkillUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    skill = get_skill(db, user, team_id, skill_id)
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(skill, field, value)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", response_model=SkillRead)
def archive_skill(skill_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    skill = get_skill(db, user, team_id, skill_id)
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    skill.is_active = False
    db.commit()
    db.refresh(skill)
    return skill
