"""Gamification-related Pydantic schemas."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class ExperimentCompleteRequest(BaseModel):
    xp_earned: Optional[int] = None
    time_spent_ms: Optional[int] = None
    score: Optional[float] = None


class GamificationProgress(BaseModel):
    total_xp: int = 0
    level: int = 1
    coins: int = 0
    streak: int = 0
    worlds_completed: int = 0
    experiments_completed: int = 0


class BadgeResponse(BaseModel):
    badge_id: str
    name: str
    description: str
    icon: str
    skill: str
    stage: int
    unlocked: bool
    unlocked_at: Optional[str] = None


class AchievementResponse(BaseModel):
    achievement_id: str
    name: str
    description: str
    icon: str
    category: str
    unlocked: bool
    unlocked_at: Optional[str] = None


class SkillResponse(BaseModel):
    skill_id: str
    name: str
    score: float
    level: str
    updated_at: Optional[str] = None


class LeaderboardEntryResponse(BaseModel):
    user_id: str
    full_name: str
    score: int
    rank: int
