"""Projects API routes — CRUD for user projects."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", summary="List user projects")
async def list_projects(current_user: User = Depends(get_current_user)):
    """Return the user's projects."""
    return []


@router.post("", summary="Create a project")
async def create_project(current_user: User = Depends(get_current_user)):
    """Create a new project."""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{project_id}", summary="Get project details")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return project details."""
    raise HTTPException(status_code=404, detail="Project not found")


@router.put("/{project_id}", summary="Update project")
async def update_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Update a project."""
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{project_id}", summary="Delete project")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a project."""
    raise HTTPException(status_code=404, detail="Project not found")
