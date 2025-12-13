"""
Routers package.
Export all routers for easy importing.
"""

from app.routers.auth import router as auth_router

__all__ = ["auth_router"]
