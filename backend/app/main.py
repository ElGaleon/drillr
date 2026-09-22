import json
import logging
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config.settings import cors_origins, is_local_environment
from .database import Base, engine, ensure_local_schema_compatibility
from .routers import athletic_tests, dashboard, health, players, reviews, roles, skills, teams

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("drillr.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    if is_local_environment():
        ensure_local_schema_compatibility()
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Drillr API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
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
        response = JSONResponse(status_code=500, content={"detail": "Internal server error"})
    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    logger.info(json.dumps({"event": "request_completed", "request_id": request_id, "method": request.method, "path": request.url.path, "status": response.status_code, "duration_ms": duration_ms}))
    return response


app.include_router(health.router)
app.include_router(teams.router)
app.include_router(dashboard.router)
app.include_router(players.router)
app.include_router(roles.router)
app.include_router(skills.router)
app.include_router(athletic_tests.router)
app.include_router(reviews.router)
