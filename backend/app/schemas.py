from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


Status = Literal["active", "injured", "inactive"]


class TeamCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    season: str = Field(default="2025/26", min_length=4, max_length=40)
    accent: str = Field(default="orange", max_length=20)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    season: str | None = Field(default=None, min_length=4, max_length=40)
    accent: str | None = Field(default=None, max_length=20)


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    season: str
    accent: str
    player_count: int = 0


class PlayerCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    birth_date: date | None = None
    primary_role: str = Field(default="Jolly", min_length=1, max_length=80)
    status: Status = "active"
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("first_name", "last_name", "primary_role")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Il campo è obbligatorio")
        return value


class PlayerUpdate(PlayerCreate):
    pass


class PlayerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    team_id: str
    first_name: str
    last_name: str
    birth_date: date | None
    primary_role: str
    status: Status
    notes: str | None
    created_at: datetime
    updated_at: datetime


class DashboardRead(BaseModel):
    team: TeamRead
    total_players: int
    active_players: int
    injured_players: int
    inactive_players: int
    recent_players: list[PlayerRead]
