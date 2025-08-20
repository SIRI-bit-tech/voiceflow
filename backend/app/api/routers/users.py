from fastapi import APIRouter, Depends
from ...api.deps.auth import get_current_user
from ...models.user import User


router = APIRouter(prefix="/api/users", tags=["users"]) 


@router.get("/me")
async def me(user: User = Depends(get_current_user)) -> dict:
    return {"id": str(user.id), "username": user.username, "role": user.role.value}


