from datetime import datetime
import math

from pydantic import BaseModel, Field, field_validator

from ..enums import AssessmentSource, SkillCategory
from .skills import SkillRead


class SkillRatingInput(BaseModel):
    skill_id: str
    score: float = Field(ge=1, le=10)
    note: str | None = Field(default=None, max_length=1000)

    @field_validator("score")
    @classmethod
    def enforce_half_point_scale(cls, value: float) -> float:
        if not math.isclose(value * 2, round(value * 2)):
            raise ValueError("Score must use 0.5 increments")
        return value


class AssessmentCreate(BaseModel):
    source: AssessmentSource
    note: str | None = Field(default=None, max_length=2000)
    ratings: list[SkillRatingInput] = Field(min_length=1)


class SkillScoreRead(BaseModel):
    skill_id: str
    skill_name: str
    category: SkillCategory
    score: float | None
    source: AssessmentSource | None
    note: str | None
    recorded_at: datetime | None


class AssessmentHistoryRead(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    category: SkillCategory
    score: float
    source: AssessmentSource
    note: str | None
    recorded_at: datetime


class PlayerSkillsRead(BaseModel):
    skills: list[SkillRead]
    current: list[SkillScoreRead]
    history: list[AssessmentHistoryRead]
