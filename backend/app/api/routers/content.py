from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel, Field
from ...services.cloudinary_service import CloudinaryService


router = APIRouter(prefix="/api/content", tags=["content"]) 


class ContentCreate(BaseModel):
    title: str = Field(min_length=1)
    body: str = Field(min_length=1)
    workspace_id: str


@router.post("")
async def create_content(body: ContentCreate) -> dict:
    return {"id": "demo", **body.model_dump()}


cloudinary_service = CloudinaryService()


@router.post("/{content_id}/upload-audio")
async def upload_audio(content_id: str, audio: UploadFile = File(...)) -> dict:
    blob = await audio.read()
    tmp = f".cache/content_{content_id}_{audio.filename}"
    with open(tmp, "wb") as f:
        f.write(blob)
    res = cloudinary_service.upload_audio(tmp)
    return {"public_id": res.get("public_id"), "url": res.get("secure_url")}


