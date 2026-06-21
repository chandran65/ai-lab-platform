"""Game progress model — tracks user progress across all games."""

from sqlalchemy import Column, ForeignKey, Index, String, Text

from app.models.base import Base


class GameProgress(Base):
    """Tracks a user's progress in a specific game."""

    __tablename__ = "game_progress"

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    game_id: str = Column(
        String(100),
        primary_key=True,
    )
    progress_data: str = Column(Text, default="{}")
    updated_at: str = Column(String(50), nullable=True)


Index("ix_game_progress_game", GameProgress.game_id)
