"""Class and class-student enrollment models."""

from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String, Text

from app.models.base import Base, TimestampMixin, UUIDMixin


class Class(Base, UUIDMixin, TimestampMixin):
    """A classroom / course group."""

    __tablename__ = "classes"

    name: str = Column(String(255), nullable=False)
    grade_level: int = Column(Integer, nullable=True)
    description: str = Column(Text, nullable=True)
    teacher_id: str = Column(String(36), ForeignKey("users.id"), nullable=True)
    school_id: str = Column(String(36), ForeignKey("schools.id"), nullable=True)
    settings: str = Column(Text, default="{}")
    is_active = Column(Boolean, default=True)


Index("ix_class_teacher_id", Class.teacher_id)
Index("ix_class_teacher_active", Class.teacher_id, Class.is_active)


class ClassStudent(Base):
    """Junction table linking students to classes."""

    __tablename__ = "class_students"

    class_id: str = Column(
        String(36),
        ForeignKey("classes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    student_id: str = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    enrolled_at: str = Column(String(50), nullable=True)
    status: str = Column(String(50), default="active")


Index("ix_class_student_class_status", ClassStudent.class_id, ClassStudent.status)
Index("ix_class_student_student", ClassStudent.student_id)
