"""Badge model — skill-based badges earned by users."""

from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String, Text

from app.models.base import Base, TimestampMixin


class Badge(Base, TimestampMixin):
    """A user's earned badge for skill achievements."""

    __tablename__ = "badge"

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    badge_id: str = Column(
        String(100),
        primary_key=True,
    )
    name: str = Column(String(255), nullable=False)
    description: str = Column(Text, nullable=True)
    icon: str = Column(String(50), nullable=True)
    skill: str = Column(String(100), nullable=False)
    stage: int = Column(Integer, default=1)
    criteria: str = Column(Text, nullable=True)
    unlocked: bool = Column(Boolean, default=False)
    unlocked_at: str = Column(String(50), nullable=True)


Index("ix_badge_user_id", Badge.user_id)
Index("ix_badge_user_unlocked", Badge.user_id, Badge.unlocked)
