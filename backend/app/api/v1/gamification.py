"""Gamification API routes — progress, badges, achievements, skills, leaderboard."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/progress", summary="Get overall gamification progress")
async def get_progress(current_user: User = Depends(get_current_user)):
    """Return the user's total XP, level, coins, streak."""
    return {
        "total_xp": 0,
        "level": 1,
        "coins": 0,
        "streak": 0,
        "worlds_completed": 0,
        "experiments_completed": 0,
    }


@router.get("/badges", summary="Get user badges")
async def get_badges(current_user: User = Depends(get_current_user)):
    """Return the user's earned badges."""
    return []


@router.get("/achievements", summary="Get user achievements")
async def get_achievements(current_user: User = Depends(get_current_user)):
    """Return the user's achievements."""
    return []


@router.get("/skills", summary="Get user skills")
async def get_skills(current_user: User = Depends(get_current_user)):
    """Return the user's skill ratings."""
    return []


@router.get("/skills/history", summary="Get skill history")
async def get_skill_history(current_user: User = Depends(get_current_user)):
    """Return skill history timeline data."""
    return {}


@router.get("/leaderboard", summary="Get leaderboard")
async def get_leaderboard(current_user: User = Depends(get_current_user)):
    """Return the leaderboard rankings."""
    return []


@router.post("/worlds/{world_id}/experiments/{experiment_id}/complete", summary="Complete an experiment")
async def complete_experiment(
    world_id: str,
    experiment_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark an experiment as completed and award XP."""
    return {
        "xp_earned": 10,
        "coins_earned": 5,
        "new_level": 1,
        "total_xp": 10,
        "badges_unlocked": [],
        "achievements_unlocked": [],
    }


@router.get("/worlds/{world_id}/progress", summary="Get world progress")
async def get_world_progress(
    world_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return the user's progress in a specific world."""
    return {
        "world_id": world_id,
        "experiments_completed": 0,
        "total_experiments": 5,
        "xp_earned": 0,
        "completed": False,
    }
