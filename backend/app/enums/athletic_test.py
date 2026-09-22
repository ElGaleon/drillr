from enum import Enum


class AthleticTestDirection(str, Enum):
    HIGHER_IS_BETTER = "higher_is_better"
    LOWER_IS_BETTER = "lower_is_better"
    TARGET_RANGE = "target_range"


class AthleticTestType(str, Enum):
    ATHLETIC = "athletic"
    TECHNICAL = "technical"
