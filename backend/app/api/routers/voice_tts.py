from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ...services.tts_service import TTSService
from ...api.deps.auth import get_current_user


router = APIRouter(prefix="/api/voice", tags=["voice"]) 


class TTSRequest(BaseModel):
    text: str = Field(min_length=1)
    lang: str = Field(default="en")


tts_service = TTSService()


@router.post("/tts")
async def tts_endpoint(body: TTSRequest, user=Depends(get_current_user)) -> dict:
    file_path = await tts_service.synthesize_to_file(body.text, body.lang)
    return {"file_path": file_path}


