"""Certificates API routes — generate and manage certificates."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", summary="List user certificates")
async def list_certificates(current_user: User = Depends(get_current_user)):
    """Return the user's certificates."""
    return []


@router.get("/{certificate_id}", summary="Get certificate details")
async def get_certificate(
    certificate_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return certificate details."""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Certificate not found")


@router.get("/{certificate_id}/download", summary="Download certificate PDF")
async def download_certificate(
    certificate_id: str,
    current_user: User = Depends(get_current_user),
):
    """Download a certificate as PDF."""
    from fastapi.responses import JSONResponse
    return JSONResponse(content={"error": "Not implemented"}, status_code=501)


@router.post("/generate/world/{world_id}", summary="Generate world completion certificate")
async def generate_world_certificate(
    world_id: str,
    current_user: User = Depends(get_current_user),
):
    """Generate a certificate for completing a world."""
    return {"status": "not_implemented"}


@router.post("/generate/skill/{skill_id}", summary="Generate skill certificate")
async def generate_skill_certificate(
    skill_id: str,
    score: int = 0,
    current_user: User = Depends(get_current_user),
):
    """Generate a certificate for achieving a skill level."""
    return {"status": "not_implemented"}


@router.post("/generate/course", summary="Generate course completion certificate")
async def generate_course_certificate(
    current_user: User = Depends(get_current_user),
):
    """Generate a certificate for completing a course."""
    return {"status": "not_implemented"}
