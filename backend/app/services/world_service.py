"""World service — learning world business logic."""

from __future__ import annotations

import json
from typing import Any, Optional

from app.models.activity import Activity
from app.models.world import World
from app.repositories.world_repository import WorldRepository


def _experiment_from_activity(act: Activity) -> dict[str, Any]:
    """Convert an Activity DB model to the frontend Experiment shape."""
    config = {}
    if act.config_schema:
        try:
            config = json.loads(act.config_schema)
        except (json.JSONDecodeError, TypeError):
            config = {}
    return {
        "id": act.id,
        "title": act.name,
        "description": act.description or "",
        "emoji": config.get("emoji", "🔬"),
        "skills": config.get("skills", []),
        "levels": config.get("levels", 1),
        "duration": config.get("duration", "5 min"),
        "gameLink": config.get("game_link"),
        "isNew": config.get("isNew", config.get("is_new", False)),
    }


def _world_to_response(world: World, experiments: list[Activity]) -> dict[str, Any]:
    """Convert a World DB model + its experiments to the frontend shape."""
    skills: list[str] = []
    if world.skills:
        try:
            skills = json.loads(world.skills)
        except (json.JSONDecodeError, TypeError):
            skills = []

    unlock_requirement = None
    if world.entry_requirements:
        try:
            reqs = json.loads(world.entry_requirements)
            if "required_world" in reqs:
                unlock_requirement = f"Complete {reqs['required_world'].replace('-', ' ').title()}"
        except (json.JSONDecodeError, TypeError):
            pass

    return {
        "id": world.id,
        "title": world.name,
        "name": world.name,
        "slug": world.slug,
        "subtitle": world.subtitle or "",
        "description": world.description or "",
        "ageRange": f"Ages {world.min_age}+",
        "minAge": world.min_age,
        "maxAge": world.max_age,
        "mascotName": world.mascot_name,
        "mascotEmoji": world.mascot_emoji,
        "mascotPersonality": world.mascot_personality or "",
        "theme": world.theme or "",
        "gradient": world.gradient or "from-indigo-400 via-purple-400 to-pink-300",
        "accentColor": world.accent_color or "#6366f1",
        "order": world.order,
        "skills": skills,
        "experiments": [_experiment_from_activity(a) for a in experiments],
        "completionReward": world.completion_reward or "",
        "unlockRequirement": unlock_requirement,
        "isActive": world.is_active,
    }


class WorldService:
    """Business logic for learning world operations."""

    def __init__(self, world_repo: WorldRepository) -> None:
        self.world_repo = world_repo

    async def get_ordered_worlds(self) -> list[dict[str, Any]]:
        worlds = await self.world_repo.get_ordered()
        result = []
        for w in worlds:
            experiments = await self.world_repo.get_activities_for_world(w.id)
            result.append(_world_to_response(w, experiments))
        return result

    async def get_world(self, world_id: str) -> Optional[dict[str, Any]]:
        world = await self.world_repo.get(world_id)
        if not world:
            return None
        experiments = await self.world_repo.get_activities_for_world(world.id)
        return _world_to_response(world, experiments)

    async def get_world_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        world = await self.world_repo.get_by_slug(slug)
        if not world:
            return None
        experiments = await self.world_repo.get_activities_for_world(world.id)
        return _world_to_response(world, experiments)

    async def get_world_activities(self, world_id: str) -> list[dict[str, Any]]:
        activities = await self.world_repo.get_activities_for_world(world_id)
        return [_experiment_from_activity(a) for a in activities]
