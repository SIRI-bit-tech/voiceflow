import uuid
from pydantic import BaseModel, Field


class ContentCreate(BaseModel):
    workspace_id: uuid.UUID
    title: str = Field(min_length=1)
    body: str = Field(min_length=1)
    lang: str = "en"


class ContentUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    lang: str | None = None
    status: str | None = None


class ContentPublic(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    body: str
    status: str
    lang: str

    class Config:
        from_attributes = True


