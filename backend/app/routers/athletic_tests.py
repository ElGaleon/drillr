from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_player, require_team
from ..models import AthleticTestDefinition, AthleticTestResult
from ..repositories.athletic_tests import get_test_definition, list_player_results, list_team_results, list_test_definitions
from ..schemas import AthleticTestDefinitionCreate, AthleticTestDefinitionRead, AthleticTestDefinitionUpdate, AthleticTestResultCreate, AthleticTestResultOverviewRead, AthleticTestResultRead
from ..services.athletic_test_service import ensure_default_test_definitions

router = APIRouter(tags=["athletic-tests"])


def read_result(result: AthleticTestResult) -> AthleticTestResultRead:
    return AthleticTestResultRead(id=result.id, test_id=result.test_id, test_name=result.test.name, category=result.test.category, unit=result.test.unit, direction=result.test.direction, value=result.value, note=result.note, recorded_at=result.recorded_at)


def read_overview_result(row: tuple[AthleticTestResult, object]) -> AthleticTestResultOverviewRead:
    result, player = row
    return AthleticTestResultOverviewRead(id=result.id, test_id=result.test_id, test_name=result.test.name, category=result.test.category, unit=result.test.unit, direction=result.test.direction, value=result.value, note=result.note, recorded_at=result.recorded_at, player_id=result.player_id, player_name=f"{player.first_name} {player.last_name}", player_role=player.primary_role)


@router.get("/api/v1/athletic-test-results", response_model=list[AthleticTestResultOverviewRead])
def get_team_test_results(team_id: str = Query(min_length=1), player_id: str | None = Query(default=None), test_id: str | None = Query(default=None), category: str | None = Query(default=None), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    return [read_overview_result(row) for row in list_team_results(db, user, team_id, player_id, test_id, category)]


@router.get("/api/v1/athletic-tests", response_model=list[AthleticTestDefinitionRead])
def get_test_definitions(team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    ensure_default_test_definitions(db, user, team_id)
    return list_test_definitions(db, user, team_id)


@router.post("/api/v1/athletic-tests", response_model=AthleticTestDefinitionRead, status_code=status.HTTP_201_CREATED)
def create_test_definition(team_id: str = Query(min_length=1), payload: AthleticTestDefinitionCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    definition = AthleticTestDefinition(owner_user_id=user.user_id, team_id=team_id, **payload.model_dump())
    definition.direction = payload.direction.value
    definition.test_type = payload.test_type.value
    db.add(definition)
    db.commit()
    db.refresh(definition)
    return definition


@router.patch("/api/v1/athletic-tests/{test_id}", response_model=AthleticTestDefinitionRead)
def update_test_definition(test_id: str, team_id: str = Query(min_length=1), payload: AthleticTestDefinitionUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    definition = get_test_definition(db, user, team_id, test_id)
    if not definition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athletic test not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(definition, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(definition)
    return definition


@router.delete("/api/v1/athletic-tests/{test_id}", response_model=AthleticTestDefinitionRead)
def archive_test_definition(test_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    definition = get_test_definition(db, user, team_id, test_id)
    if not definition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athletic test not found")
    definition.is_active = False
    db.commit()
    db.refresh(definition)
    return definition


@router.get("/api/v1/players/{player_id}/athletic-tests", response_model=list[AthleticTestResultRead])
def get_player_test_results(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    return [read_result(result) for result in list_player_results(db, user, team_id, player_id)]


@router.post("/api/v1/players/{player_id}/athletic-tests", response_model=AthleticTestResultRead, status_code=status.HTTP_201_CREATED)
def create_player_test_result(player_id: str, team_id: str = Query(min_length=1), payload: AthleticTestResultCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    definition = get_test_definition(db, user, team_id, payload.test_id)
    if not definition or not definition.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active athletic test not found")
    result = AthleticTestResult(owner_user_id=user.user_id, team_id=team_id, player_id=player_id, **payload.model_dump(exclude_none=True))
    db.add(result)
    db.commit()
    db.refresh(result)
    result.test = definition
    return read_result(result)
