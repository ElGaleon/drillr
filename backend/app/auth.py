import os
from dataclasses import dataclass

import jwt
from fastapi import Depends, Header, HTTPException, status


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    session_id: str | None = None


def get_current_user(
    authorization: str | None = Header(default=None),
    x_dev_user_id: str | None = Header(default=None),
) -> AuthenticatedUser:
    if os.getenv("DEV_AUTH_BYPASS", "false").lower() == "true":
        return AuthenticatedUser(x_dev_user_id or os.getenv("DEV_USER_ID", "demo_user"))

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autenticazione richiesta")

    token = authorization.split(" ", 1)[1]
    public_key = os.getenv("CLERK_JWT_KEY")
    issuer = os.getenv("CLERK_ISSUER")
    if not public_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth non configurata")

    try:
        claims = jwt.decode(token, public_key, algorithms=["RS256"], issuer=issuer or None, options={"verify_aud": False})
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido") from exc

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token senza soggetto")
    return AuthenticatedUser(user_id=user_id, session_id=claims.get("sid"))


CurrentUser = Depends(get_current_user)
