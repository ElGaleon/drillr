import logging
import json
import os
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .auth import AuthenticatedUser, get_current_user
from .database import Base, engine, get_db
from .models import Player, Team
from .schemas import DashboardRead, PlayerCreate, PlayerRead, PlayerUpdate, TeamCreate, TeamRead, TeamUpdate

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("drillr.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    if os.getenv("APP_ENV", "local") == "local":
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Drillr API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid4()))
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.error(json.dumps({"event": "unhandled_request_error", "request_id": request_id}), exc_info=True)
        response = JSONResponse(status_code=500, content={"detail": "Errore interno"})
    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    logger.info(json.dumps({"event": "request_completed", "request_id": request_id, "method": request.method, "path": request.url.path, "status": response.status_code, "duration_ms": duration_ms}))
    return response


def require_team(db: Session, user: AuthenticatedUser, team_id: str) -> Team:
    team = db.scalar(select(Team).where(Team.id == team_id, Team.owner_user_id == user.user_id))
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team non trovato")
    return team


def team_read(db: Session, team: Team) -> TeamRead:
    count = db.scalar(select(func.count(Player.id)).where(Player.team_id == team.id, Player.owner_user_id == team.owner_user_id)) or 0
    return TeamRead.model_validate(team).model_copy(update={"player_count": count})


def maybe_seed_demo(db: Session, user: AuthenticatedUser) -> None:
    if os.getenv("DEV_AUTH_BYPASS", "false").lower() != "true" or db.scalar(select(Team).where(Team.owner_user_id == user.user_id)):
        return
    team = Team(owner_user_id=user.user_id, name="Prima squadra", season="2025/26", accent="orange")
    db.add(team)
    db.flush()
    for first_name, last_name, role, status_value in [("Luca", "Bianchi", "Playmaker", "active"), ("Marco", "Rossi", "Guardia", "active"), ("Andrea", "Conti", "Ala", "injured"), ("Davide", "Esposito", "Centro", "active")]:
        db.add(Player(owner_user_id=user.user_id, team_id=team.id, first_name=first_name, last_name=last_name, primary_role=role, status=status_value))
    db.commit()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/teams", response_model=list[TeamRead])
def list_teams(db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    maybe_seed_demo(db, user)
    teams = db.scalars(select(Team).where(Team.owner_user_id == user.user_id).order_by(Team.created_at)).all()
    return [team_read(db, team) for team in teams]


@app.post("/api/v1/teams", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    team = Team(owner_user_id=user.user_id, **payload.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return team_read(db, team)


@app.patch("/api/v1/teams/{team_id}", response_model=TeamRead)
def update_team(team_id: str, payload: TeamUpdate, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    team = require_team(db, user, team_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    return team_read(db, team)


@app.get("/api/v1/players", response_model=list[PlayerRead])
def list_players(team_id: str = Query(min_length=1), search: str | None = Query(default=None, max_length=80), player_status: str | None = Query(default=None, alias="status"), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    query = select(Player).where(Player.team_id == team_id, Player.owner_user_id == user.user_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.where((Player.first_name.ilike(term)) | (Player.last_name.ilike(term)))
    if player_status and player_status != "all":
        query = query.where(Player.status == player_status)
    return db.scalars(query.order_by(Player.last_name, Player.first_name)).all()


@app.post("/api/v1/players", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(team_id: str = Query(min_length=1), payload: PlayerCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = Player(owner_user_id=user.user_id, team_id=team_id, **payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@app.get("/api/v1/players/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = db.scalar(select(Player).where(Player.id == player_id, Player.team_id == team_id, Player.owner_user_id == user.user_id))
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Giocatore non trovato")
    return player


@app.patch("/api/v1/players/{player_id}", response_model=PlayerRead)
def update_player(player_id: str, team_id: str = Query(min_length=1), payload: PlayerUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    player = db.scalar(select(Player).where(Player.id == player_id, Player.team_id == team_id, Player.owner_user_id == user.user_id))
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Giocatore non trovato")
    for field, value in payload.model_dump().items():
        setattr(player, field, value)
    db.commit()
    db.refresh(player)
    return player


@app.get("/api/v1/dashboard", response_model=DashboardRead)
def dashboard(team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    team = require_team(db, user, team_id)
    players = db.scalars(select(Player).where(Player.team_id == team_id, Player.owner_user_id == user.user_id).order_by(Player.created_at.desc())).all()
    counts = {status_value: sum(player.status == status_value for player in players) for status_value in ("active", "injured", "inactive")}
    return DashboardRead(team=team_read(db, team), total_players=len(players), active_players=counts["active"], injured_players=counts["injured"], inactive_players=counts["inactive"], recent_players=players[:5])
