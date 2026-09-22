from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .base import utc_now


class AthleticTestDefinition(Base):
    __tablename__ = "athletic_test_definitions"
    __table_args__ = (
        Index("ix_athletic_test_definitions_owner_team", "owner_user_id", "team_id"),
        Index("ix_athletic_test_definitions_team_active", "team_id", "is_active"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    test_type: Mapped[str] = mapped_column(String(20), default="athletic", nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    direction: Mapped[str] = mapped_column(String(30), nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    results = relationship("AthleticTestResult", back_populates="test", cascade="all, delete-orphan")


class AthleticTestResult(Base):
    __tablename__ = "athletic_test_results"
    __table_args__ = (
        Index("ix_athletic_test_results_owner_team_player", "owner_user_id", "team_id", "player_id"),
        Index("ix_athletic_test_results_player_test_recorded", "player_id", "test_id", "recorded_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    player_id: Mapped[str] = mapped_column(ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    test_id: Mapped[str] = mapped_column(ForeignKey("athletic_test_definitions.id", ondelete="RESTRICT"), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    test = relationship("AthleticTestDefinition", back_populates="results")
