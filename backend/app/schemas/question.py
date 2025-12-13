"""
Question schemas.
Defines request/response shapes for question-related endpoints.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─────────────────────────────────────────────────────────────────
# REQUEST SCHEMAS (what client sends)
# ─────────────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    """
    Schema for creating a new question.
    Client sends: just the message text
    """
    message: str


class QuestionAnswer(BaseModel):
    """
    Schema for answering a question.
    Client sends: the answer text
    """
    answer: str


class QuestionStatusUpdate(BaseModel):
    """
    Schema for updating question status (admin only).
    Client sends: new status
    Valid statuses: "Pending", "Escalated", "Answered"
    """
    status: str


# ─────────────────────────────────────────────────────────────────
# RESPONSE SCHEMAS (what we send back)
# ─────────────────────────────────────────────────────────────────

class QuestionResponse(BaseModel):
    """
    Schema for question data in responses.
    Includes all question fields.
    """
    question_id: int
    message: str
    status: str
    timestamp: datetime
    answer: Optional[str] = None
    answered_by: Optional[int] = None
    answered_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy model to Pydantic


# ─────────────────────────────────────────────────────────────────
# WEBSOCKET MESSAGE SCHEMAS
# ─────────────────────────────────────────────────────────────────

class WebSocketMessage(BaseModel):
    """
    Schema for WebSocket broadcast messages.
    type: "NEW_QUESTION", "QUESTION_ANSWERED", "QUESTION_UPDATED"
    data: The question data
    """
    type: str
    data: dict

