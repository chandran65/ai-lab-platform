"""Transpiler API routes — convert block code to Python/JavaScript."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/to-python", summary="Convert blocks to Python")
async def to_python(current_user: User = Depends(get_current_user)):
    """Convert block XML to Python code."""
    return {"code": "# Block code conversion not implemented"}


@router.post("/to-javascript", summary="Convert blocks to JavaScript")
async def to_javascript(current_user: User = Depends(get_current_user)):
    """Convert block XML to JavaScript code."""
    return {"code": "// Block code conversion not implemented"}
