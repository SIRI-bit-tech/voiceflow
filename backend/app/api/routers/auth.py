from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ...core.security import create_access_token, hash_password, verify_password
from ...db.session import get_db_session
from ...models.user import User, UserRole
from ...schemas.user import UserCreate, UserPublic


router = APIRouter(prefix="/api/auth", tags=["auth"]) 


class LoginRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=3)


@router.post("/register")
async def register(body: UserCreate, db: AsyncSession = Depends(get_db_session)) -> dict:
    exists = await db.execute(select(User).where((User.email == body.email) | (User.username == body.username)))
    if exists.scalar_one_or_none():
        raise HTTPException(400, detail="User already exists")
    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password),
        role=UserRole.creator,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(str(user.id), claims={"username": user.username})
    return {"access_token": token, "token_type": "bearer", "user": {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
    }}


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db_session)) -> dict:
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


