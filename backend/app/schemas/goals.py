import math
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    skill_id: str | None = None
    target_score: float = Field(ge=1, le=10)
    due_date: date | None = None

    @field_validator("target_score")
    @classmethod
    def enforce_half_point_scale(cls, value: float) -> float:
        if not math.isclose(value * 2, round(value * 2)):
            raise ValueError("Target score must use 0.5 increments")
        return value


class GoalRead(BaseModel):
    id: str
    title: str
    skill_id: str | None
    skill_name: str | None
    target_score: float
    due_date: date | None
    status: str
    created_at: datetime

