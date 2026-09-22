from pydantic import BaseModel

from .players import PlayerRead
from .teams import TeamRead


class DashboardRead(BaseModel):
    team: TeamRead
    total_players: int
    active_players: int
    injured_players: int
    inactive_players: int
    recent_players: list[PlayerRead]
