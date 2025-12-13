"""
Routers package.
Export all routers for easy importing.
"""

from app.routers.auth import router as auth_router
from app.routers.questions import router as questions_router

__all__ = ["auth_router", "questions_router"]
