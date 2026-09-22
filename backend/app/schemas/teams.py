from pydantic import BaseModel, ConfigDict, Field


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
