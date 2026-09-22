from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..enums import ReviewStatus, ReviewVisibility


class ReviewCreate(BaseModel):
    review_date: date
    strengths: str | None = Field(default=None, max_length=5000)
    next_steps: str | None = Field(default=None, max_length=5000)
    development_path: str | None = Field(default=None, max_length=5000)
    coach_notes: str | None = Field(default=None, max_length=5000)
    visibility: ReviewVisibility = ReviewVisibility.STAFF
    status: ReviewStatus = ReviewStatus.DRAFT

    @field_validator("strengths", "next_steps", "development_path", "coach_notes")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ReviewUpdate(BaseModel):
    review_date: date | None = None
    strengths: str | None = Field(default=None, max_length=5000)
    next_steps: str | None = Field(default=None, max_length=5000)
    development_path: str | None = Field(default=None, max_length=5000)
    coach_notes: str | None = Field(default=None, max_length=5000)
    visibility: ReviewVisibility | None = None
    status: ReviewStatus | None = None

    @field_validator("strengths", "next_steps", "development_path", "coach_notes")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    player_id: str
    review_date: date
    strengths: str | None
    next_steps: str | None
    development_path: str | None
    coach_notes: str | None
    visibility: ReviewVisibility
    status: ReviewStatus
    created_at: datetime
    updated_at: datetime


class ReviewOverviewRead(ReviewRead):
    player_name: str
    player_role: str
