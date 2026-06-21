"""Admin API routes — platform administration."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter()


@router.get("/stats", summary="Get platform stats")
async def get_admin_stats(current_user: User = Depends(get_current_admin)):
    """Return platform-wide statistics."""
    return {
        "total_users": 0,
        "total_schools": 0,
        "total_classes": 0,
        "total_projects": 0,
    }


@router.get("/users", summary="List all users")
async def list_admin_users(current_user: User = Depends(get_current_admin)):
    """Return all platform users."""
    return []
