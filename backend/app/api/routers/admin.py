from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import json
from ...api.deps.auth import require_roles
from ...models.user import User, UserRole
from ...models.content import Content
from ...db.session import get_db_session
from ...services.redis_service import get_redis


router = APIRouter(prefix="/api/admin", tags=["admin"]) 
redis_client = get_redis()


@router.get("/analytics/voice")
async def voice_analytics(
    days: int = 7,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.admin)),
) -> dict:
    """Get voice command analytics"""
    # Get command logs from Redis
    logs = await redis_client.lrange("command_log", 0, -1)
    commands = [json.loads(log) for log in logs]
    
    # Filter by date range
    cutoff = datetime.now() - timedelta(days=days)
    recent_commands = [
        cmd for cmd in commands 
        if datetime.fromtimestamp(cmd.get("timestamp", 0)) > cutoff
    ]
    
    # Analyze intents
    intent_counts = {}
    for cmd in recent_commands:
        intent = cmd.get("intent", {}).get("intent", "unknown")
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
    
    # Calculate accuracy
    total_commands = len(recent_commands)
    successful_commands = len([c for c in recent_commands if c.get("intent", {}).get("confidence", 0) > 0.7])
    
    return {
        "total_commands": total_commands,
        "successful_commands": successful_commands,
        "accuracy_rate": successful_commands / total_commands if total_commands > 0 else 0,
        "intent_distribution": intent_counts,
        "period_days": days
    }


@router.get("/analytics/users")
async def user_analytics(
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_roles(UserRole.admin)),
) -> dict:
    """Get user activity analytics"""
    # User counts by role
    role_counts = {}
    for role in UserRole:
        count = await db.execute(select(func.count(User.id)).where(User.role == role))
        role_counts[role.value] = count.scalar()
    
    # Content creation stats
    content_stats = await db.execute(
        select(
            func.count(Content.id),
            func.count(Content.id).filter(Content.status == "published")
        )
    )
    total_content, published_content = content_stats.first()
    
    # Active users (with recent activity)
    active_users = await redis_client.scard("active_users")
    
    return {
        "total_users": sum(role_counts.values()),
        "users_by_role": role_counts,
        "total_content": total_content,
        "published_content": published_content,
        "active_users": active_users
    }


@router.get("/latency")
async def latency(
    user: User = Depends(require_roles(UserRole.admin)),
) -> dict:
    """Get system performance metrics"""
    # Get recent command processing times from Redis
    recent_logs = await redis_client.lrange("command_log", 0, 99)
    if recent_logs:
        timestamps = [json.loads(log).get("timestamp", 0) for log in recent_logs]
        if timestamps:
            processing_times = [t2 - t1 for t1, t2 in zip(timestamps[:-1], timestamps[1:])]
            avg_latency = sum(processing_times) / len(processing_times) if processing_times else 0
            p95_latency = sorted(processing_times)[int(len(processing_times) * 0.95)] if processing_times else 0
        else:
            avg_latency = p95_latency = 0
    else:
        avg_latency = p95_latency = 0
    
    return {
        "avg_latency_ms": round(avg_latency * 1000, 2),
        "p95_latency_ms": round(p95_latency * 1000, 2),
        "active_connections": len(await redis_client.keys("ws:*")),
        "redis_memory_usage": await redis_client.info("memory").get("used_memory_human", "N/A")
    }


@router.get("/presence/{workspace_id}")
async def workspace_presence(
    workspace_id: str,
    user: User = Depends(require_roles(UserRole.admin)),
) -> dict:
    """Get real-time presence for a workspace"""
    # Get active users in workspace
    presence_key = f"presence:{workspace_id}"
    active_users = await redis_client.smembers(presence_key)
    
    return {
        "workspace_id": workspace_id,
        "active_users": list(active_users),
        "user_count": len(active_users)
    }


@router.get("/system/health")
async def system_health(
    user: User = Depends(require_roles(UserRole.admin)),
) -> dict:
    """Get comprehensive system health status"""
    try:
        # Check Redis
        redis_ping = await redis_client.ping()
        
        # Check database
        db_health = True
        try:
            await redis_client.execute("SELECT 1")
        except:
            db_health = False
        
        # Get system metrics
        redis_info = await redis_client.info()
        
        return {
            "status": "healthy" if redis_ping and db_health else "degraded",
            "redis": {
                "connected": redis_ping,
                "memory_usage": redis_info.get("used_memory_human"),
                "connected_clients": redis_info.get("connected_clients")
            },
            "database": {
                "connected": db_health
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


