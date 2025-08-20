from fastapi import APIRouter


router = APIRouter(prefix="/api/workspaces", tags=["workspaces"]) 


@router.get("")
async def list_workspaces() -> list[dict]:
    return [
        {"id": "default", "name": "Default Workspace"},
    ]


