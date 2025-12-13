"""
Authentication service.
Handles password hashing and JWT token operations.
"""

from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

from app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_HOURS


# ─────────────────────────────────────────────────────────────────
# PASSWORD HASHING (using bcrypt directly)
# ─────────────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        plain_password: The password in plain text
        
    Returns:
        The hashed password string
        
    Example:
        hashed = hash_password("secret123")
        # Returns: "$2b$12$LQv3c1yqBwe..."
    """
    # Convert to bytes, hash, then return as string
    password_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The password in plain text
        hashed_password: The stored hashed password
        
    Returns:
        True if password matches, False otherwise
        
    Example:
        is_valid = verify_password("secret123", stored_hash)
        # Returns: True or False
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


# ─────────────────────────────────────────────────────────────────
# JWT TOKEN OPERATIONS
# ─────────────────────────────────────────────────────────────────

def create_access_token(user_id: int, username: str) -> str:
    """
    Create a JWT access token for a user.
    
    Args:
        user_id: The user's database ID
        username: The user's username
        
    Returns:
        JWT token string
        
    Example:
        token = create_access_token(1, "john")
        # Returns: "eyJhbGciOiJIUzI1NiIs..."
    """
    # Token expires in 24 hours (configurable in config.py)
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Payload contains user info + expiration
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": expire
    }
    
    # Encode and return the token
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify and decode a JWT access token.
    
    Args:
        token: The JWT token string
        
    Returns:
        The decoded payload dict if valid, None if invalid/expired
        
    Example:
        payload = verify_access_token("eyJhbGciOiJIUzI1NiIs...")
        # Returns: {"user_id": 1, "username": "john", "exp": ...}
        # Or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        return None
