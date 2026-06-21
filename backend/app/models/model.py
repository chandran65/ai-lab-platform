"""ML Model — represents a trained machine learning model."""

from sqlalchemy import Column, Float, ForeignKey, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class MlModel(Base, UUIDMixin, TimestampMixin):
    """A trained ML model instance."""

    __tablename__ = "ml_model"

    project_id: str = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: str = Column(String(255), nullable=False)
    model_type: str = Column(String(100), nullable=False)
    status: str = Column(String(50), default="training")
    accuracy: float = Column(Float, nullable=True)
    model_path: str = Column(String(512), nullable=True)
    config: str = Column(Text, default="{}")
    training_config: str = Column(Text, default="{}")
    metrics: str = Column(Text, default="{}")
