from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    admin_code: str


class AdminLogin(BaseModel):
    username: str
    password: str
    admin_code: str


class AdminResponse(BaseModel):
    id: str
    username: str
    email: str
    is_super_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    admin: AdminResponse


class AdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
