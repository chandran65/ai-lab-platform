"""World-related Pydantic schemas."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class ExperimentResponse(BaseModel):
    id: str
    title: str
    description: str
    emoji: str = "🔬"
    skills: list[str] = []
    levels: int = 1
    duration: str = "5 min"
    gameLink: Optional[str] = None
    isNew: bool = False


class WorldResponse(BaseModel):
    id: str
    title: str
    name: str
    slug: str
    subtitle: str = ""
    description: str = ""
    ageRange: str = ""
    minAge: int = 4
    maxAge: int = 18
    mascotName: Optional[str] = None
    mascotEmoji: Optional[str] = None
    mascotPersonality: str = ""
    theme: str = ""
    gradient: str = "from-indigo-400 via-purple-400 to-pink-300"
    accentColor: str = "#6366f1"
    order: int = 0
    skills: list[str] = []
    experiments: list[ExperimentResponse] = []
    completionReward: str = ""
    unlockRequirement: Optional[str] = None
    isActive: bool = True

    class Config:
        from_attributes = True
