from fastapi import APIRouter


router = APIRouter(prefix="/api/voice/speaker", tags=["speaker"]) 


@router.get("/profile")
async def profile() -> dict:
    return {"threshold": 0.75}


