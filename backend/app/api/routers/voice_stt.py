from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel

from ...services.stt_whisper_service import WhisperSTTService
from pathlib import Path


router = APIRouter(prefix="/api/voice", tags=["voice"]) 


stt_service = WhisperSTTService(model_name="base")
UPLOAD_DIR = Path('.cache')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/stt")
async def stt_endpoint(
    audio: UploadFile = File(...),
    language: str | None = Form(default=None),
) -> dict:
    contents = await audio.read()
    tmp_path = UPLOAD_DIR / f"upload_{audio.filename}"
    with open(tmp_path, "wb") as f:
        f.write(contents)

    text = await stt_service.transcribe_file(str(tmp_path), language=language)
    return {"text": text, "language": language}


