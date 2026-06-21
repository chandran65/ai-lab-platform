"""School model."""

from sqlalchemy import Boolean, Column, Integer, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class School(Base, UUIDMixin, TimestampMixin):
    """Educational institution / school."""

    __tablename__ = "schools"

    name: str = Column(String(255), nullable=False)
    domain: str = Column(String(255), unique=True, nullable=False)
    settings: str = Column(Text, default="{}")
    max_users: int = Column(Integer, default=1000)
    max_storage_gb: int = Column(Integer, default=100)
    is_active: bool = Column(Boolean, default=True)
