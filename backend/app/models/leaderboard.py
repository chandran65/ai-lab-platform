"""Leaderboard entry model — tracks rankings and scores."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text

from app.models.base import Base, TimestampMixin


class LeaderboardEntry(Base, TimestampMixin):
    """A user's leaderboard entry for a specific category."""

    __tablename__ = "leaderboard_entry"

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    category: str = Column(
        String(100),
        primary_key=True,
    )
    score: int = Column(Integer, default=0)
    rank: int = Column(Integer, nullable=True)
    metadata_: str = Column("metadata", Text, default="{}")
    period_start: str = Column(String(50), nullable=True)
    period_end: str = Column(String(50), nullable=True)
