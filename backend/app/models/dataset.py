"""Dataset model — uploaded data for ML training."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class Dataset(Base, UUIDMixin, TimestampMixin):
    """A dataset belonging to a project."""

    __tablename__ = "datasets"

    project_id: str = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: str = Column(String(255), nullable=False)
    dataset_type: str = Column(String(100), nullable=False)
    storage_path: str = Column(String(512), nullable=True)
    record_count: int = Column(Integer, default=0)
    classes: str = Column(Text, default="[]")
    metadata_: str = Column("metadata", Text, default="{}")
    is_processed: bool = Column(Boolean, default=False)
