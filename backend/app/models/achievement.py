"""Achievement model — tracks user achievements."""

from sqlalchemy import Boolean, Column, ForeignKey, Index, String, Text

from app.models.base import Base, TimestampMixin


class Achievement(Base, TimestampMixin):
    """A user's earned achievement."""

    __tablename__ = "achievement"

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    achievement_id: str = Column(
        String(100),
        primary_key=True,
    )
    name: str = Column(String(255), nullable=False)
    description: str = Column(Text, nullable=True)
    icon: str = Column(String(50), nullable=True)
    category: str = Column(String(100), nullable=True)
    unlocked: bool = Column(Boolean, default=False)
    unlocked_at: str = Column(String(50), nullable=True)
    metadata_: str = Column("metadata", Text, default="{}")
