from fastapi import APIRouter


router = APIRouter(prefix="/api/admin", tags=["admin"]) 


@router.get("/latency")
async def latency() -> dict:
    return {"p95_ms": 120}


