"""Games API routes — game progress tracking."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/progress", summary="Get all game progress")
async def get_all_progress(current_user: User = Depends(get_current_user)):
    """Return progress data for all games."""
    return {}


@router.get("/progress/{game_id}", summary="Get game progress")
async def get_game_progress(
    game_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return progress for a specific game."""
    return {}


@router.post("/progress/{game_id}", summary="Save game progress")
async def save_game_progress(
    game_id: str,
    current_user: User = Depends(get_current_user),
):
    """Save progress for a specific game."""
    return {"status": "saved"}
