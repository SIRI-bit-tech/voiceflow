from pydantic import BaseModel, EmailStr, Field
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    role: str

    class Config:
        from_attributes = True


