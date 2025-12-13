"""
Question model.
Represents questions posted by users (guests or admins).
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Question(Base):
    """
    Questions table.
    Stores all Q&A questions posted on the dashboard.
    
    Columns:
        question_id: Primary key
        message: The question text
        status: "Pending", "Escalated", or "Answered"
        timestamp: When the question was posted
        answer: The answer text (nullable until answered)
        answered_by: Foreign key to user who marked it answered
        answered_at: When the question was marked answered
    """
    __tablename__ = "questions"
    
    question_id = Column(Integer, primary_key=True, autoincrement=True)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="Pending")  # Pending, Escalated, Answered
    timestamp = Column(DateTime, server_default=func.now())
    answer = Column(Text, nullable=True)
    answered_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    answered_at = Column(DateTime, nullable=True)
    
    # Relationship to get the user who answered
    answered_by_user = relationship("User", backref="answered_questions")

