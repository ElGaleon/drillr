from enum import Enum


class PlayerStatus(str, Enum):
    ACTIVE = "active"
    INJURED = "injured"
    INACTIVE = "inactive"
