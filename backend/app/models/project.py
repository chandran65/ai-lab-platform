"""Project model — ML projects, notebooks, and activities."""

from sqlalchemy import Boolean, Column, ForeignKey, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    """A user project (ML, notebook, block code, etc.)."""

    __tablename__ = "projects"

    name: str = Column(String(255), nullable=False)
    description: str = Column(Text, nullable=True)
    project_type: str = Column(String(100), nullable=False)
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    class_id: str = Column(String(36), ForeignKey("classes.id"), nullable=True)
    school_id: str = Column(String(36), ForeignKey("schools.id"), nullable=True)
    block_code: str = Column(Text, nullable=True)
    python_code: str = Column(Text, nullable=True)
    settings: str = Column(Text, default="{}")
    is_template: bool = Column(Boolean, default=False)
    is_public: bool = Column(Boolean, default=False)
