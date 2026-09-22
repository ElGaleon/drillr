from enum import Enum


class RoleType(str, Enum):
    PRIMARY = "primary"
    ZONE_DEFENSE = "zone_defense"
