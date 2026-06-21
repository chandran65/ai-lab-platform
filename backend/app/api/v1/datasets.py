"""Datasets API routes — manage project datasets."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/projects")


@router.get("/{project_id}/datasets", summary="List project datasets")
async def list_datasets(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return datasets for a project."""
    return []


@router.post("/{project_id}/datasets", summary="Create a dataset")
async def create_dataset(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Create a new dataset."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{project_id}/datasets/{dataset_id}/upload", summary="Upload dataset files")
async def upload_dataset(
    project_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
):
    """Upload files to a dataset."""
    return {"status": "not_implemented"}


@router.delete("/{project_id}/datasets/{dataset_id}", summary="Delete dataset")
async def delete_dataset(
    project_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a dataset."""
    return {"status": "deleted"}
