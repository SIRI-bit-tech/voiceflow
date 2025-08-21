from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from ...api.deps.auth import get_current_admin
from ...core.config import settings
from ...core.security import create_access_token, verify_password, hash_password
from ...db.session import get_db_session
from ...models.admin import Admin
from ...schemas.admin import AdminCreate, AdminLogin, AdminResponse, Token
from ...services.redis_service import get_redis


router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"]) 
redis_client = get_redis()


@router.post("/register", response_model=Token)
async def register_admin(
    admin_data: AdminCreate,
    db: AsyncSession = Depends(get_db_session),
) -> Token:
    """Register a new admin user"""
    # Check if admin registration is enabled
    registration_enabled = await redis_client.get("admin_registration_enabled")
    if registration_enabled == "false":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin registration is currently disabled"
        )
    
    # Validate admin security code
    if admin_data.admin_code != settings.ADMIN_SECURITY_CODE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin security code"
        )
    
    # Check if admin already exists
    existing_admin = await db.execute(
        select(Admin).where(Admin.username == admin_data.username)
    )
    if existing_admin.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin username already registered"
        )
    
    # Create new admin
    hashed_password = hash_password(admin_data.password)
    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hashed_password,
        is_super_admin=False  # First admin becomes super admin
    )
    
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    # Log admin creation
    await redis_client.lpush("admin_audit_log", f"Admin created: {admin.username}")
    
    # Create access token for immediate login
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(
        data={"sub": str(admin.id), "role": "admin", "username": admin.username},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            is_super_admin=admin.is_super_admin,
            created_at=admin.created_at
        )
    )


@router.post("/login", response_model=Token)
async def login_admin(
    admin_data: AdminLogin,
    db: AsyncSession = Depends(get_db_session),
) -> Token:
    """Login admin user"""
    # Validate admin security code
    if admin_data.admin_code != settings.ADMIN_SECURITY_CODE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin security code"
        )
    
    # Find admin by username
    admin = await db.execute(
        select(Admin).where(Admin.username == admin_data.username)
    )
    admin = admin.scalar_one_or_none()
    
    if not admin or not verify_password(admin_data.password, admin.password_hash):
        # Log failed login attempt
        await redis_client.lpush("admin_audit_log", f"Failed login attempt: {admin_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if admin is active
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is deactivated"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(
        data={"sub": str(admin.id), "role": "admin", "username": admin.username},
        expires_delta=access_token_expires
    )
    
    # Log successful login
    await redis_client.lpush("admin_audit_log", f"Admin login: {admin.username}")
    
    # Update last login
    admin.last_login = db.execute("SELECT NOW()").scalar()
    await db.commit()
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            is_super_admin=admin.is_super_admin,
            created_at=admin.created_at
        )
    )


@router.post("/logout")
async def logout_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Logout admin user"""
    # Log logout
    await redis_client.lpush("admin_audit_log", f"Admin logout: {current_admin.username}")
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_admin),
) -> AdminResponse:
    """Get current admin information"""
    return AdminResponse(
        id=current_admin.id,
        username=current_admin.username,
        email=current_admin.email,
        is_super_admin=current_admin.is_super_admin,
        created_at=current_admin.created_at
    )


@router.post("/change-password")
async def change_admin_password(
    current_password: str,
    new_password: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Change admin password"""
    # Verify current password
    if not verify_password(current_password, current_admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_admin.password_hash = hash_password(new_password)
    await db.commit()
    
    # Log password change
    await redis_client.lpush("admin_audit_log", f"Password changed: {current_admin.username}")
    
    return {"message": "Password changed successfully"}


@router.post("/enable-registration")
async def enable_admin_registration(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Enable admin registration (super admin only)"""
    if not current_admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can enable registration"
        )
    
    await redis_client.set("admin_registration_enabled", "true")
    await redis_client.lpush("admin_audit_log", f"Admin registration enabled by: {current_admin.username}")
    
    return {"message": "Admin registration enabled"}


@router.post("/disable-registration")
async def disable_admin_registration(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Disable admin registration (super admin only)"""
    if not current_admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can disable registration"
        )
    
    await redis_client.set("admin_registration_enabled", "false")
    await redis_client.lpush("admin_audit_log", f"Admin registration disabled by: {current_admin.username}")
    
    return {"message": "Admin registration disabled"}
