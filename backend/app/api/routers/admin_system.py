from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import asyncio
from ...api.deps.auth import get_current_admin, require_super_admin
from ...db.session import get_db_session
from ...services.redis_service import get_redis
from ...models.admin import Admin


router = APIRouter(prefix="/api/admin/system", tags=["admin-system"]) 
redis_client = get_redis()


@router.post("/voice-processing")
async def toggle_voice_processing(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Toggle voice processing system"""
    current_status = await redis_client.get("voice_processing_enabled")
    new_status = "false" if current_status == "true" else "true"
    
    await redis_client.set("voice_processing_enabled", new_status)
    await redis_client.lpush("admin_audit_log", 
        f"Voice processing {'enabled' if new_status == 'true' else 'disabled'} by: {current_admin.username}")
    
    return {
        "message": f"Voice processing {'enabled' if new_status == 'true' else 'disabled'}",
        "status": new_status == "true"
    }


@router.post("/user-registration")
async def toggle_user_registration(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Toggle user registration system"""
    current_status = await redis_client.get("user_registration_enabled")
    new_status = "false" if current_status == "true" else "true"
    
    await redis_client.set("user_registration_enabled", new_status)
    await redis_client.lpush("admin_audit_log", 
        f"User registration {'enabled' if new_status == 'true' else 'disabled'} by: {current_admin.username}")
    
    return {
        "message": f"User registration {'enabled' if new_status == 'true' else 'disabled'}",
        "status": new_status == "true"
    }


@router.post("/maintenance")
async def toggle_maintenance_mode(
    current_admin: Admin = Depends(require_super_admin()),
) -> dict:
    """Toggle maintenance mode (super admin only)"""
    current_status = await redis_client.get("maintenance_mode")
    new_status = "true" if current_status != "true" else "false"
    
    await redis_client.set("maintenance_mode", new_status)
    await redis_client.lpush("admin_audit_log", 
        f"Maintenance mode {'enabled' if new_status == 'true' else 'disabled'} by: {current_admin.username}")
    
    return {
        "message": f"Maintenance mode {'enabled' if new_status == 'true' else 'disabled'}",
        "status": new_status == "true"
    }


@router.post("/backup")
async def trigger_backup(
    current_admin: Admin = Depends(require_super_admin()),
) -> dict:
    """Trigger system backup (super admin only)"""
    backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Log backup initiation
    await redis_client.lpush("admin_audit_log", 
        f"System backup initiated by: {current_admin.username} (ID: {backup_id})")
    
    # Simulate backup process (in production, this would trigger actual backup)
    await asyncio.sleep(2)  # Simulate backup time
    
    # Store backup info
    backup_info = {
        "id": backup_id,
        "initiated_by": current_admin.username,
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    }
    
    await redis_client.lpush("backup_log", str(backup_info))
    
    return {
        "message": "System backup completed successfully",
        "backup_id": backup_id,
        "timestamp": backup_info["timestamp"]
    }


@router.get("/status")
async def get_system_status(
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Get current system status"""
    voice_processing = await redis_client.get("voice_processing_enabled") == "true"
    user_registration = await redis_client.get("user_registration_enabled") == "true"
    maintenance_mode = await redis_client.get("maintenance_mode") == "true"
    admin_registration = await redis_client.get("admin_registration_enabled") == "true"
    
    # Get system metrics
    active_connections = len(await redis_client.keys("ws:*"))
    redis_memory = await redis_client.info("memory")
    
    return {
        "voice_processing_enabled": voice_processing,
        "user_registration_enabled": user_registration,
        "maintenance_mode": maintenance_mode,
        "admin_registration_enabled": admin_registration,
        "active_connections": active_connections,
        "redis_memory_usage": redis_memory.get("used_memory_human", "N/A"),
        "timestamp": datetime.now().isoformat()
    }


@router.get("/logs")
async def get_system_logs(
    log_type: str = "audit",
    limit: int = 100,
    current_admin: Admin = Depends(get_current_admin),
) -> dict:
    """Get system logs"""
    if log_type not in ["audit", "backup", "command"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid log type. Must be 'audit', 'backup', or 'command'"
        )
    
    log_key = f"{log_type}_log"
    logs = await redis_client.lrange(log_key, 0, limit - 1)
    
    return {
        "log_type": log_type,
        "logs": logs,
        "count": len(logs)
    }


@router.post("/clear-logs")
async def clear_system_logs(
    log_type: str = "audit",
    current_admin: Admin = Depends(require_super_admin()),
) -> dict:
    """Clear system logs (super admin only)"""
    if log_type not in ["audit", "backup", "command"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid log type. Must be 'audit', 'backup', or 'command'"
        )
    
    log_key = f"{log_type}_log"
    await redis_client.delete(log_key)
    
    await redis_client.lpush("admin_audit_log", 
        f"Logs cleared ({log_type}) by: {current_admin.username}")
    
    return {
        "message": f"{log_type.capitalize()} logs cleared successfully"
    }


@router.post("/restart-services")
async def restart_services(
    service: str = "all",
    current_admin: Admin = Depends(require_super_admin()),
) -> dict:
    """Restart system services (super admin only)"""
    valid_services = ["all", "voice", "websocket", "database", "redis"]
    
    if service not in valid_services:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid service. Must be one of: {', '.join(valid_services)}"
        )
    
    # Log restart request
    await redis_client.lpush("admin_audit_log", 
        f"Service restart requested ({service}) by: {current_admin.username}")
    
    # In production, this would trigger actual service restarts
    # For now, we'll simulate the restart
    await asyncio.sleep(1)
    
    return {
        "message": f"Service restart initiated for: {service}",
        "timestamp": datetime.now().isoformat()
    }
