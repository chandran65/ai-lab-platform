"""Worlds API router — age-based learning worlds with nested experiments."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_world_service
from app.schemas.world import ExperimentResponse, WorldResponse
from app.services.world_service import WorldService

router = APIRouter()


@router.get(
    "",
    response_model=list[WorldResponse],
    summary="List all learning worlds",
)
async def list_worlds(
    world_service: WorldService = Depends(get_world_service),
):
    """List all active learning worlds in display order, each with nested experiments."""
    return await world_service.get_ordered_worlds()


@router.get(
    "/{world_id}",
    response_model=WorldResponse,
    summary="Get a learning world by ID",
    responses={404: {"description": "World not found"}},
)
async def get_world(
    world_id: str,
    world_service: WorldService = Depends(get_world_service),
):
    """Get a specific learning world by its UUID."""
    world = await world_service.get_world(world_id)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    return world


@router.get(
    "/slug/{slug}",
    response_model=WorldResponse,
    summary="Get a learning world by URL slug",
    responses={404: {"description": "World not found"}},
)
async def get_world_by_slug(
    slug: str,
    world_service: WorldService = Depends(get_world_service),
):
    """Get a learning world by its URL-friendly slug."""
    world = await world_service.get_world_by_slug(slug)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    return world


@router.get(
    "/{world_id}/activities",
    response_model=list[ExperimentResponse],
    summary="Get experiments for a world",
    responses={404: {"description": "World not found"}},
)
async def get_world_activities(
    world_id: str,
    world_service: WorldService = Depends(get_world_service),
):
    """Get all experiments for a specific learning world."""
    return await world_service.get_world_activities(world_id)
