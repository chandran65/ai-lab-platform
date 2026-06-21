"""Activity and activity log models."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text, func

from app.models.base import Base, TimestampMixin, UUIDMixin


class Activity(Base, UUIDMixin, TimestampMixin):
    """A curriculum activity / experiment."""

    __tablename__ = "activities"

    name: str = Column(String(255), nullable=False)
    description: str = Column(Text, nullable=True)
    activity_type: str = Column(String(100), nullable=False)
    grade_levels: str = Column(Text, default="[]")
    difficulty: str = Column(String(50), default="beginner")
    config_schema: str = Column(Text, default="{}")
    instructions: str = Column(Text, nullable=True)
    thumbnail_url: str = Column(String(512), nullable=True)
    created_by: str = Column(String(36), nullable=True)
    is_public: bool = Column(Boolean, default=True)
    is_featured: bool = Column(Boolean, default=False)
    world_id: str = Column(String(36), ForeignKey("world.id"), nullable=True)


class ActivityLog(Base, UUIDMixin):
    """Log entry for a user's activity interaction."""

    __tablename__ = "activity_logs"

    activity_id: str = Column(String(36), ForeignKey("activities.id"), nullable=True)
    project_id: str = Column(String(36), ForeignKey("projects.id"), nullable=True)
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    action: str = Column(String(100), nullable=False)
    result: str = Column(Text, default="{}")
    duration_ms: int = Column(Integer, nullable=True)
    metadata_: str = Column("metadata", Text, default="{}")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


Index("ix_activity_log_user_action", ActivityLog.user_id, ActivityLog.action)
Index("ix_activity_log_user_created", ActivityLog.user_id, ActivityLog.created_at)
