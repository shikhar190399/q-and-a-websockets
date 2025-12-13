"""
User model.
Represents admin users who can login and mark questions as answered.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    """
    Users table.
    Stores admin users who can login to the dashboard.
    
    Columns:
        user_id: Primary key
        username: Display name
        email: Unique email for login
        password: Hashed password (never store plain text!)
        created_at: When the user registered
    """
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Will store hashed password
    created_at = Column(DateTime, server_default=func.now())

