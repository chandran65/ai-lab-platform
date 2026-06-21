"""World repository — data access layer for World model."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity
from app.models.world import World


class WorldRepository:
    """Data access for World model."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_ordered(self) -> list[World]:
        stmt = select(World).where(World.is_active == True).order_by(World.order)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get(self, world_id: str) -> Optional[World]:
        return await self.session.get(World, world_id)

    async def get_by_slug(self, slug: str) -> Optional[World]:
        stmt = select(World).where(World.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_activities_for_world(self, world_id: str) -> list[Activity]:
        stmt = select(Activity).where(Activity.world_id == world_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
