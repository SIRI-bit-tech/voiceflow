import hashlib
import time
from fastapi import APIRouter, Depends, HTTPException
from ...core.config import settings
from ...api.deps.auth import get_current_user


router = APIRouter(prefix="/api/media", tags=["media"]) 


@router.get("/cloudinary/signature")
async def cloudinary_signature(user=Depends(get_current_user)) -> dict:
    if not (settings.cloudinary_api_key and settings.cloudinary_api_secret and settings.cloudinary_cloud_name):
        raise HTTPException(400, detail="Cloudinary not configured")
    timestamp = int(time.time())
    params_to_sign = f"timestamp={timestamp}{settings.cloudinary_api_secret}"
    signature = hashlib.sha1(params_to_sign.encode()).hexdigest()
    return {
        "cloud_name": settings.cloudinary_cloud_name,
        "api_key": settings.cloudinary_api_key,
        "timestamp": timestamp,
        "signature": signature,
    }


