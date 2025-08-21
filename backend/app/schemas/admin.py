from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional


class AdminCreate(BaseModel):
    # Accept both snake_case and camelCase (adminCode)
    model_config = ConfigDict(populate_by_name=True)

    username: str
    email: EmailStr
    password: str
    admin_code: str = Field(alias="adminCode")


class AdminLogin(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str
    password: str
    admin_code: str = Field(alias="adminCode")


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
