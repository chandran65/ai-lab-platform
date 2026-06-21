"""Classes API routes — manage student classes."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_teacher, get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", summary="List user's classes")
async def list_classes(current_user: User = Depends(get_current_user)):
    """Return the user's classes."""
    return []


@router.post("", summary="Create a class")
async def create_class(current_user: User = Depends(get_current_teacher)):
    """Create a new class."""
    from fastapi import HTTPException
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{class_id}", summary="Get class details")
async def get_class(
    class_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return class details."""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Class not found")


@router.post("/{class_id}/students", summary="Add students to class")
async def add_students(
    class_id: str,
    current_user: User = Depends(get_current_teacher),
):
    """Add students to a class."""
    return {"status": "not_implemented"}


@router.delete("/{class_id}/students/{student_id}", summary="Remove student from class")
async def remove_student(
    class_id: str,
    student_id: str,
    current_user: User = Depends(get_current_teacher),
):
    """Remove a student from a class."""
    return {"status": "not_implemented"}
