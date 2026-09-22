import os
from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./drillr.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def ensure_local_schema_compatibility() -> None:
    """Add the small set of additive columns needed by older local SQLite DBs."""
    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as connection:
        inspector = inspect(connection)
        if "athletic_test_definitions" not in inspector.get_table_names():
            return
        columns = {column["name"] for column in inspector.get_columns("athletic_test_definitions")}
        if "test_type" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE athletic_test_definitions "
                    "ADD COLUMN test_type VARCHAR(20) NOT NULL DEFAULT 'athletic'"
                )
            )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
