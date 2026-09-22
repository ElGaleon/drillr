import os


def app_environment() -> str:
    return os.getenv("APP_ENV", "local")


def is_local_environment() -> bool:
    return app_environment() == "local"


def auth_bypass_enabled() -> bool:
    return os.getenv("DEV_AUTH_BYPASS", "false").lower() == "true"


def cors_origins() -> list[str]:
    return os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173,http://127.0.0.1:5174",
    ).split(",")
