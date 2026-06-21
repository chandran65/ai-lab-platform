"""Certificate model — course, skill, and world completion certificates."""

from sqlalchemy import Boolean, Column, ForeignKey, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class Certificate(Base, UUIDMixin, TimestampMixin):
    """A certificate awarded to a user upon completion."""

    user_id: str = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    certificate_type: str = Column(String(50), nullable=False)
    title: str = Column(String(255), nullable=False)
    description: str = Column(Text, nullable=True)
    reference_id: str = Column(String(100), nullable=True)
    file_path: str = Column(String(512), nullable=True)
    issued_at: str = Column(String(50), nullable=True)
    expires_at: str = Column(String(50), nullable=True)
    is_verified: bool = Column(Boolean, default=False)
    metadata_: str = Column("metadata", Text, default="{}")
