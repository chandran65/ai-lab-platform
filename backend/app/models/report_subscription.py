"""Report subscription model — teacher preferences for scheduled PDF reports."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class ReportSubscription(Base, UUIDMixin, TimestampMixin):
    """A teacher's subscription to receive automated analytics reports."""

    user_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    class_id: str = Column(
        String(36),
        ForeignKey("classes.id", ondelete="CASCADE"),
        nullable=True,
    )
    frequency: str = Column(String(20), default="weekly")
    day_of_week: int = Column(Integer, default=1)
    day_of_month: int = Column(Integer, default=1)
    is_active: bool = Column(Boolean, default=True)
    last_sent_at: str = Column(String(50), nullable=True)
    next_send_at: str = Column(String(50), nullable=True)
