from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..enums import RoleType


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    role_type: RoleType
    sort_order: int = Field(default=0, ge=0, le=999)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Role name is required")
        return value


class RoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    sort_order: int | None = Field(default=None, ge=0, le=999)
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Role name is required")
        return value


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    team_id: str
    name: str
    role_type: RoleType
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
