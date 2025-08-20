from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...core.config import settings
from ...core.security import verify_token
from ...db.session import get_db_session
from ...models.user import User, UserRole
from ...models.admin import Admin

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session),
) -> Admin:
    """Get current admin from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        admin_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if admin_id is None or role != "admin":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    admin = await db.execute(select(Admin).where(Admin.id == admin_id))
    admin = admin.scalar_one_or_none()
    
    if admin is None or not admin.is_active:
        raise credentials_exception
    
    return admin


def require_roles(*roles: UserRole):
    """Require specific user roles"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker


def require_super_admin():
    """Require super admin privileges"""
    def super_admin_checker(current_admin: Admin = Depends(get_current_admin)) -> Admin:
        if not current_admin.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin privileges required"
            )
        return current_admin
    return super_admin_checker


