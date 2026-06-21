"""
Mindora Platform — Custom exceptions.
"""

from __future__ import annotations


class MindoraError(Exception):
    """Base exception for all Mindora platform errors."""


class NotFoundError(MindoraError):
    """Raised when a requested resource is not found."""


class AuthenticationError(MindoraError):
    """Raised when authentication fails."""


class AuthorizationError(MindoraError):
    """Raised when the user lacks permission."""


class DuplicateError(MindoraError):
    """Raised when attempting to create a duplicate resource."""


class ValidationError(MindoraError):
    """Raised when input validation fails."""
