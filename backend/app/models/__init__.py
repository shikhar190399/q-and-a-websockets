"""
Models package.
Export all models for easy importing.
"""

from app.models.user import User
from app.models.question import Question

# This allows: from app.models import User, Question
__all__ = ["User", "Question"]
