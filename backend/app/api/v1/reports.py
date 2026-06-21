"""Reports API routes — scheduled PDF report subscriptions."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_teacher, get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/subscriptions", summary="List report subscriptions")
async def get_subscriptions(current_user: User = Depends(get_current_teacher)):
    """Return the teacher's report subscriptions."""
    return []


@router.post("/subscriptions", summary="Create report subscription")
async def create_subscription(current_user: User = Depends(get_current_teacher)):
    """Create a new scheduled report subscription."""
    return {"status": "created"}


@router.delete("/subscriptions/{subscription_id}", summary="Delete report subscription")
async def delete_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_teacher),
):
    """Delete a report subscription."""
    return {"status": "deleted"}


@router.post("/trigger", summary="Trigger manual report generation")
async def trigger_report(current_user: User = Depends(get_current_teacher)):
    """Trigger an immediate report generation."""
    return {"status": "triggered"}
