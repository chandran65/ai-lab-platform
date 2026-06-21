"""Training job model — tracks ML training execution."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.models.base import Base, UUIDMixin


class TrainingJob(Base, UUIDMixin):
    """A training job for an ML model."""

    __tablename__ = "training_jobs"

    model_id: str = Column(String(36), ForeignKey("ml_model.id"), nullable=True)
    project_id: str = Column(String(36), ForeignKey("projects.id"), nullable=True)
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    status: str = Column(String(50), default="pending")
    progress: int = Column(Integer, default=0)
    config: str = Column(Text, default="{}")
    result: str = Column(Text, default="{}")
    error_message: str = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
