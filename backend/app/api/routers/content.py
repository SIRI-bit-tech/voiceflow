from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from ...services.cloudinary_service import CloudinaryService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ...db.session import get_db_session
from ...models.content import Content, ContentStatus
from ...models.user import User, UserRole
from ...api.deps.auth import require_roles


router = APIRouter(prefix="/api/content", tags=["content"]) 


class ContentCreate(BaseModel):
    title: str = Field(min_length=1)
    body: str = Field(min_length=1)
    workspace_id: str


@router.post("")
async def create_content(
    body: ContentCreate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.creator, UserRole.editor, UserRole.admin)),
) -> dict:
    item = Content(
        workspace_id=body.workspace_id,
        title=body.title,
        body=body.body,
        status=ContentStatus.draft,
        created_by=user.id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": str(item.id), "title": item.title, "body": item.body, "status": item.status.value}


cloudinary_service = CloudinaryService()


@router.post("/{content_id}/upload-audio")
async def upload_audio(content_id: str, audio: UploadFile = File(...)) -> dict:
    blob = await audio.read()
    tmp = f".cache/content_{content_id}_{audio.filename}"
    with open(tmp, "wb") as f:
        f.write(blob)
    res = cloudinary_service.upload_audio(tmp)
    return {"public_id": res.get("public_id"), "url": res.get("secure_url")}


@router.get("")
async def list_content(
    workspace_id: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.creator, UserRole.editor, UserRole.admin)),
) -> list[dict]:
    stmt = select(Content)
    if workspace_id:
        stmt = stmt.where(Content.workspace_id == workspace_id)
    rows = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": str(r.id),
            "workspace_id": str(r.workspace_id),
            "title": r.title,
            "body": r.body,
            "status": r.status.value,
            "lang": r.lang,
        }
        for r in rows
    ]


@router.get("/{content_id}")
async def get_content(
    content_id: str,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.creator, UserRole.editor, UserRole.admin)),
) -> dict:
    row = (await db.execute(select(Content).where(Content.id == content_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Not found")
    return {
        "id": str(row.id),
        "workspace_id": str(row.workspace_id),
        "title": row.title,
        "body": row.body,
        "status": row.status.value,
        "lang": row.lang,
    }


class ContentUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    lang: str | None = None
    status: str | None = None


@router.patch("/{content_id}")
async def update_content(
    content_id: str,
    body: ContentUpdate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.editor, UserRole.admin)),
) -> dict:
    row = (await db.execute(select(Content).where(Content.id == content_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Not found")
    if body.title is not None:
        row.title = body.title
    if body.body is not None:
        row.body = body.body
    if body.lang is not None:
        row.lang = body.lang
    await db.commit()
    await db.refresh(row)
    return {"id": str(row.id), "title": row.title, "body": row.body, "status": row.status.value}


@router.post("/{content_id}/publish")
async def publish_content(
    content_id: str,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.editor, UserRole.admin)),
) -> dict:
    row = (await db.execute(select(Content).where(Content.id == content_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Not found")
    row.status = ContentStatus.published
    await db.commit()
    return {"id": str(row.id), "status": row.status.value}


@router.post("/{content_id}/archive")
async def archive_content(
    content_id: str,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.editor, UserRole.admin)),
) -> dict:
    row = (await db.execute(select(Content).where(Content.id == content_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Not found")
    row.status = ContentStatus.draft
    await db.commit()
    return {"id": str(row.id), "status": row.status.value}


