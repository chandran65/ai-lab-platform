"""ML API routes — model training, jobs, predictions."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/train", summary="Start a training job")
async def start_training(current_user: User = Depends(get_current_user)):
    """Start a new model training job."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/jobs", summary="List training jobs")
async def list_jobs(current_user: User = Depends(get_current_user)):
    """Return training jobs."""
    return []


@router.get("/jobs/{job_id}", summary="Get training job status")
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return training job details."""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Job not found")


@router.delete("/jobs/{job_id}", summary="Cancel training job")
async def cancel_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Cancel a training job."""
    return {"status": "cancelled"}


@router.get("/models", summary="List ML models")
async def list_models(current_user: User = Depends(get_current_user)):
    """Return the user's ML models."""
    return []


@router.get("/models/{model_id}", summary="Get model details")
async def get_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return model details."""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Model not found")


@router.post("/models/{model_id}/predict", summary="Run prediction")
async def predict(
    model_id: str,
    current_user: User = Depends(get_current_user),
):
    """Run a prediction using a trained model."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/models/{model_id}", summary="Delete model")
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a trained model."""
    return {"status": "deleted"}
