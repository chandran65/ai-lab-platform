"""Code execution API routes — run Python/JavaScript code."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/run", summary="Run code")
async def run_code(current_user: User = Depends(get_current_user)):
    """Execute code and return output."""
    return {"output": "", "error": None, "execution_time_ms": 0}


@router.get("/sessions", summary="List execution sessions")
async def list_sessions(current_user: User = Depends(get_current_user)):
    """Return active execution sessions."""
    return []


@router.post("/sessions/{session_id}/interrupt", summary="Interrupt execution")
async def interrupt_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Interrupt a running execution."""
    return {"status": "interrupted"}
