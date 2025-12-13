"""
Shared dependencies.
Reusable dependencies for FastAPI routes.
"""

from fastapi import Header, HTTPException, status
from typing import Optional

from app.services.auth import verify_access_token


def get_current_user(authorization: str = Header(default=None)) -> Optional[dict]:
    """
    Dependency to get current user from JWT token.
    Used for admin-only routes.
    
    Usage:
        @router.patch("/protected")
        def protected_route(user: dict = Depends(get_current_user)):
            # user = {"user_id": 1, "username": "john", ...}
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    # Extract token from "Bearer <token>"
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use: Bearer <token>"
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Verify token
    payload = verify_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return payload

