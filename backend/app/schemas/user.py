"""
User schemas.
Defines request/response shapes for user-related endpoints.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime


# ─────────────────────────────────────────────────────────────────
# REQUEST SCHEMAS (what client sends)
# ─────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    """
    Schema for user registration.
    Client sends: username, email, password
    """
    username: str
    email: EmailStr  # Validates email format automatically
    password: str


class UserLogin(BaseModel):
    """
    Schema for user login.
    Client sends: email, password
    """
    email: EmailStr
    password: str


# ─────────────────────────────────────────────────────────────────
# RESPONSE SCHEMAS (what we send back)
# ─────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """
    Schema for user data in responses.
    NOTE: No password field - never expose passwords!
    """
    user_id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy model to Pydantic


class TokenResponse(BaseModel):
    """
    Schema for login response with JWT token.
    """
    access_token: str
    token_type: str = "bearer"

