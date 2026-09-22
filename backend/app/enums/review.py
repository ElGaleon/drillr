from enum import Enum


class ReviewStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ReviewVisibility(str, Enum):
    STAFF = "staff"
    PLAYER = "player"
