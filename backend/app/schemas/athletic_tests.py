from datetime import datetime
import math

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..enums import AthleticTestDirection, AthleticTestType


class AthleticTestDefinitionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    test_type: AthleticTestType = AthleticTestType.ATHLETIC
    unit: str = Field(min_length=1, max_length=30)
    direction: AthleticTestDirection
    sort_order: int = Field(default=0, ge=0, le=999)

    @field_validator("name", "category", "unit")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Value is required")
        return value


class AthleticTestDefinitionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    test_type: AthleticTestType | None = None
    unit: str | None = Field(default=None, min_length=1, max_length=30)
    direction: AthleticTestDirection | None = None
    sort_order: int | None = Field(default=None, ge=0, le=999)
    is_active: bool | None = None

    @field_validator("name", "category", "unit")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Value is required")
        return value


class AthleticTestDefinitionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    name: str
    category: str
    test_type: AthleticTestType
    unit: str
    direction: AthleticTestDirection
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AthleticTestResultCreate(BaseModel):
    test_id: str
    value: float = Field(ge=0, le=100000)
    note: str | None = Field(default=None, max_length=2000)
    recorded_at: datetime | None = None

    @field_validator("value")
    @classmethod
    def finite_value(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("Value must be finite")
        return value


class AthleticTestResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    test_id: str
    test_name: str
    category: str
    unit: str
    direction: AthleticTestDirection
    value: float
    note: str | None
    recorded_at: datetime


class AthleticTestResultOverviewRead(AthleticTestResultRead):
    player_id: str
    player_name: str
    player_role: str
