"""Activities API routes — list and launch AI experiments."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", summary="List all activities")
async def list_activities(
    current_user: User = Depends(get_current_user),
):
    """Return all available activities/experiments."""
    return []


@router.get("/{activity_id}", summary="Get activity details")
async def get_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return details for a specific activity."""
    raise HTTPException(status_code=404, detail="Activity not found")


@router.post("/{activity_id}/launch", summary="Launch an activity")
async def launch_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user),
):
    """Create a project from an activity template and return the project ID."""
    raise HTTPException(status_code=404, detail="Activity not found")
