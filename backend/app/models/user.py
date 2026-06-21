"""User model."""

from sqlalchemy import Boolean, Column, ForeignKey, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    """Platform user (student, teacher, admin)."""

    __tablename__ = "users"

    email: str = Column(String(255), nullable=False)
    password_hash: str = Column(String(255), nullable=False)
    full_name: str = Column(String(255), nullable=False)
    role: str = Column(String(50), default="student")
    school_id: str = Column(String(36), ForeignKey("schools.id"), nullable=True)
    avatar_url: str = Column(String(512), nullable=True)
    preferences: str = Column(Text, default="{}")
    is_active: bool = Column(Boolean, default=True)
    last_login_at: str = Column(String(50), nullable=True)
