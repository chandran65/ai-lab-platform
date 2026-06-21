"""Auth-related Pydantic schemas."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    school_id: Optional[str] = None
    preferences: Optional[dict] = None

    class Config:
        from_attributes = True


class UpdateMeRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class EnforcementResponse(BaseModel):
    enforce_authentication: bool


class EnforcementToggleRequest(BaseModel):
    enabled: bool
