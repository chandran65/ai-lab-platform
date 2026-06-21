"""Skill model — tracks student skill ratings."""

from sqlalchemy import Column, Float, ForeignKey, Index, String, Text

from app.models.base import Base, TimestampMixin


class Skill(Base, TimestampMixin):
    """A student's skill rating for a specific competency."""

    __tablename__ = "skill"

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id: str = Column(
        String(100),
        primary_key=True,
    )
    name: str = Column(String(255), nullable=False)
    score: float = Column(Float, default=0.0)
    level: str = Column(String(50), default="Curious Rookie")
    metadata_: str = Column("metadata", Text, default="{}")
    updated_at: str = Column(String(50), nullable=True)


Index("ix_skill_user_id", Skill.user_id)
