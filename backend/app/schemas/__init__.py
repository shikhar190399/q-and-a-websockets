"""
Schemas package.
Export all schemas for easy importing.
"""

from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
)

from app.schemas.question import (
    QuestionCreate,
    QuestionAnswer,
    QuestionStatusUpdate,
    QuestionResponse,
    WebSocketMessage,
)

__all__ = [
    # User schemas
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    # Question schemas
    "QuestionCreate",
    "QuestionAnswer",
    "QuestionStatusUpdate",
    "QuestionResponse",
    "WebSocketMessage",
]
