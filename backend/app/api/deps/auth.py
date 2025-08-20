from typing import Annotated
from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ...core.config import settings
from ...db.session import get_db_session
from ...models.user import User
from ...models.user import UserRole


async def get_current_user(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    db: AsyncSession = Depends(get_db_session),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(401, detail="Invalid token")
    except JWTError:
        raise HTTPException(401, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == sub))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, detail="User not found")
    return user


def require_roles(*roles: UserRole):
    async def _dep(user: User = Depends(get_current_user)) -> User:
        if roles and user.role not in roles:
            raise HTTPException(403, detail="Insufficient role")
        return user
    return _dep


