from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_player, require_team
from ..models import Player, PlayerGoal, PlayerSkillAssessment
from ..repositories.goals import list_player_goals
from ..repositories.players import get_player as find_player, list_players
from ..repositories.skills import get_skill
from ..schemas import AssessmentCreate, GoalCreate, GoalRead, PlayerCreate, PlayerRead, PlayerSkillsRead, PlayerUpdate
from ..services.skill_service import player_skill_snapshot

router = APIRouter(prefix="/api/v1/players", tags=["players"])


def read_goal(goal: PlayerGoal) -> GoalRead:
    return GoalRead(id=goal.id, title=goal.title, skill_id=goal.skill_id, skill_name=goal.skill.name if goal.skill else None, target_score=goal.target_score, due_date=goal.due_date, status=goal.status, created_at=goal.created_at)


@router.get("", response_model=list[PlayerRead])
def get_players(team_id: str = Query(min_length=1), search: str | None = Query(default=None, max_length=80), player_status: str | None = Query(default=None, alias="status"), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    return list_players(db, user, team_id, search, player_status)


@router.post("", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(team_id: str = Query(min_length=1), payload: PlayerCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = Player(owner_user_id=user.user_id, team_id=team_id, **payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}/skills", response_model=PlayerSkillsRead)
def get_player_skills(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    from ..services.team_service import ensure_default_skills

    ensure_default_skills(db, user, team_id)
    return player_skill_snapshot(db, user, team_id, player_id)


@router.get("/{player_id}/goals", response_model=list[GoalRead])
def get_player_goals(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    return [read_goal(goal) for goal in list_player_goals(db, user, team_id, player_id)]


@router.post("/{player_id}/goals", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_player_goal(player_id: str, team_id: str = Query(min_length=1), payload: GoalCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    skill = get_skill(db, user, team_id, payload.skill_id) if payload.skill_id else None
    if payload.skill_id and not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    goal = PlayerGoal(owner_user_id=user.user_id, team_id=team_id, player_id=player_id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    goal.skill = skill
    return read_goal(goal)


@router.post("/{player_id}/assessments", response_model=PlayerSkillsRead, status_code=status.HTTP_201_CREATED)
def create_player_assessment(player_id: str, team_id: str = Query(min_length=1), payload: AssessmentCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    skill_ids = [rating.skill_id for rating in payload.ratings]
    if len(skill_ids) != len(set(skill_ids)):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Each skill can only be rated once per submission")
    skills = [skill for skill in (get_skill(db, user, team_id, skill_id) for skill_id in skill_ids) if skill]
    if len(skills) != len(skill_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more skills were not found")
    for rating in payload.ratings:
        db.add(PlayerSkillAssessment(owner_user_id=user.user_id, team_id=team_id, player_id=player_id, skill_id=rating.skill_id, score=rating.score, source=payload.source, note=rating.note or payload.note))
    db.commit()
    return player_skill_snapshot(db, user, team_id, player_id)


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = find_player(db, user, team_id, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    return player


@router.patch("/{player_id}", response_model=PlayerRead)
def update_player(player_id: str, team_id: str = Query(min_length=1), payload: PlayerUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = find_player(db, user, team_id, player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    for field, value in payload.model_dump().items():
        setattr(player, field, value)
    db.commit()
    db.refresh(player)
    return player
