from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .workspaces import router as workspaces_router
from .content import router as content_router
from .voice_stt import router as voice_stt_router
from .voice_tts import router as voice_tts_router
from .speaker_id import router as speaker_router


api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspaces_router)
api_router.include_router(content_router)
api_router.include_router(voice_stt_router)
api_router.include_router(voice_tts_router)
api_router.include_router(speaker_router)



