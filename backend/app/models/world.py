"""World model — age-based learning worlds."""

from sqlalchemy import Boolean, Column, Integer, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class World(Base, UUIDMixin, TimestampMixin):
    """A learning world / age-based content track."""

    name: str = Column(String(255), nullable=False)
    slug: str = Column(String(100), unique=True, nullable=False)
    subtitle: str = Column(String(255), nullable=True)
    description: str = Column(Text, nullable=True)
    theme: str = Column(String(255), nullable=True)
    mascot_name: str = Column(String(100), nullable=True)
    mascot_emoji: str = Column(String(10), nullable=True)
    mascot_personality: str = Column(String(255), nullable=True)
    min_age: int = Column(Integer, nullable=False)
    max_age: int = Column(Integer, nullable=False)
    order: int = Column(Integer, default=0)
    skills: str = Column(Text, default="[]")
    gradient: str = Column(String(255), nullable=True)
    accent_color: str = Column(String(50), nullable=True)
    completion_reward: str = Column(String(255), nullable=True)
    thumbnail_url: str = Column(String(512), nullable=True)
    is_active: bool = Column(Boolean, default=True)
    entry_requirements: str = Column(Text, default="{}")
