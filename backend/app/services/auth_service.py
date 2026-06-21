"""Auth service — login, register, token management, profile updates."""

from __future__ import annotations

import json
from typing import Optional

from app.core.exceptions import AuthenticationError, DuplicateError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    TokenResponse,
    UpdateMeRequest,
    UserResponse,
)


class AuthService:
    """Business logic for authentication."""

    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        await self.user_repo.update_last_login(user.id)

        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
        )

    async def register(
        self, email: str, password: str, full_name: str, role: str
    ) -> TokenResponse:
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise DuplicateError("Email already registered")

        user = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role=role,
        )
        await self.user_repo.create(user)

        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
        )

    async def refresh_token(self, token: str) -> TokenResponse:
        payload = decode_token(token)
        if not payload or payload.get("type") != "refresh":
            raise AuthenticationError("Invalid refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token payload")

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")

        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
        )

    async def get_me(self, user_id: str) -> Optional[UserResponse]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user)

    async def update_me(self, user_id: str, body: UpdateMeRequest) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")

        if body.full_name is not None:
            user.full_name = body.full_name
        if body.avatar_url is not None:
            user.avatar_url = body.avatar_url
        if body.preferences is not None:
            user.preferences = json.dumps(body.preferences)

        await self.user_repo.update(user)
        return UserResponse.model_validate(user)

    async def change_password(
        self, user_id: str, old_password: str, new_password: str
    ) -> None:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")
        if not verify_password(old_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")

        user.password_hash = get_password_hash(new_password)
        await self.user_repo.update(user)
