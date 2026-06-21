"""
Mindora Platform — Base Model.

Provides the SQLAlchemy DeclarativeBase and common mixins
(timestamps, UUID primary key) shared by all models.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.sqlite import TEXT
from sqlalchemy.orm import declared_attr

from app.core.database import Base as _Base


class Base(_Base):
    """Abstract base model with auto tablename."""

    __abstract__ = True
    __allow_unmapped__ = True

    @declared_attr
    def __tablename__(cls) -> str:
        """Auto-generate snake_case table name from class name."""
        import re
        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        return name.rstrip("_")


class TimestampMixin:
    """Adds created_at and updated_at timestamp columns."""

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """Adds a UUID primary key column."""

    id = Column(
        TEXT,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
