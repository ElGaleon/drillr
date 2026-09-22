from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..enums import Availability, DominantHand, Gender, PlayerStatus


class PlayerCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    preferred_name: str | None = Field(default=None, max_length=80)
    nationality: str | None = Field(default=None, max_length=80)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    photo_url: str | None = Field(default=None, max_length=500)
    birth_date: date | None = None
    gender: Gender | None = None
    dominant_hand: DominantHand | None = None
    primary_role: str = Field(default="Handler", min_length=1, max_length=80)
    secondary_role: str | None = Field(default=None, max_length=80)
    jersey_number: int | None = Field(default=None, ge=0, le=99)
    height_cm: int | None = Field(default=None, ge=100, le=250)
    weight_kg: float | None = Field(default=None, ge=20, le=250)
    status: PlayerStatus = PlayerStatus.ACTIVE
    availability: Availability | None = None
    medical_notes: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("first_name", "last_name", "preferred_name", "nationality", "email", "phone", "photo_url", "primary_role", "secondary_role")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value


class PlayerUpdate(PlayerCreate):
    pass


class PlayerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    first_name: str
    last_name: str
    preferred_name: str | None
    nationality: str | None
    email: str | None
    phone: str | None
    photo_url: str | None
    birth_date: date | None
    gender: Gender | None
    dominant_hand: DominantHand | None
    primary_role: str
    secondary_role: str | None
    jersey_number: int | None
    height_cm: int | None
    weight_kg: float | None
    status: PlayerStatus
    availability: Availability | None
    medical_notes: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
