from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .base import utc_now


class Team(Base):
    __tablename__ = "teams"
    __table_args__ = (Index("ix_teams_owner", "owner_user_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    season: Mapped[str] = mapped_column(String(40), nullable=False, default="2025/26")
    accent: Mapped[str] = mapped_column(String(20), nullable=False, default="orange")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    players: Mapped[list["Player"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    skills: Mapped[list["SkillDefinition"]] = relationship(back_populates="team", cascade="all, delete-orphan")
