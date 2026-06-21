"""Auth API routes — login, register, token refresh, user profile."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_auth_service, get_current_user
from app.core.exceptions import AuthenticationError, DuplicateError
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    EnforcementResponse,
    EnforcementToggleRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UpdateMeRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()

# In-memory enforcement flag (can be persisted for production)
_enforce_auth = False


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
async def login(
    body: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate a user and return JWT tokens."""
    try:
        return await auth_service.login(body.email, body.password)
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/register",
    response_model=TokenResponse,
    summary="Register a new user",
)
async def register(
    body: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Create a new user account and return JWT tokens."""
    try:
        return await auth_service.register(body.email, body.password, body.full_name, body.role)
    except DuplicateError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an access token",
)
async def refresh(
    body: RefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Exchange a valid refresh token for a new token pair."""
    try:
        return await auth_service.refresh_token(body.refresh_token)
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Return the authenticated user's profile."""
    result = await auth_service.get_me(current_user.id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return result


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
)
async def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Update the authenticated user's profile fields."""
    try:
        return await auth_service.update_me(current_user.id, body)
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/password",
    summary="Change current user password",
)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Change the authenticated user's password."""
    try:
        await auth_service.change_password(current_user.id, body.old_password, body.new_password)
        return {"message": "Password updated successfully"}
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/enforcement-status",
    response_model=EnforcementResponse,
    summary="Get auth enforcement status",
)
async def get_enforcement_status():
    """Return whether forced authentication is enabled."""
    return EnforcementResponse(enforce_authentication=_enforce_auth)


@router.post(
    "/toggle-enforcement",
    response_model=EnforcementResponse,
    summary="Toggle auth enforcement",
)
async def toggle_enforcement(body: EnforcementToggleRequest):
    """Enable or disable forced authentication."""
    global _enforce_auth
    _enforce_auth = body.enabled
    return EnforcementResponse(enforce_authentication=_enforce_auth)
