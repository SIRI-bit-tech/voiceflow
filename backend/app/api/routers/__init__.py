from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .workspaces import router as workspaces_router
from .content import router as content_router
from .voice_stt import router as voice_stt_router
from .voice_tts import router as voice_tts_router
from .speaker_id import router as speaker_id_router
from .admin import router as admin_router
from .streaming import router as streaming_router
from .media import router as media_router
from .admin_auth import router as admin_auth_router
from .admin_system import router as admin_system_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspaces_router)
api_router.include_router(content_router)
api_router.include_router(voice_stt_router)
api_router.include_router(voice_tts_router)
api_router.include_router(speaker_id_router)
api_router.include_router(admin_router)
api_router.include_router(streaming_router)
api_router.include_router(media_router)
api_router.include_router(admin_auth_router)
api_router.include_router(admin_system_router)



