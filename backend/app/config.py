"""
Configuration module.
Loads environment variables from .env file.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application settings
SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-for-dev")
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qa_database.db")

# JWT settings
ACCESS_TOKEN_EXPIRE_HOURS: int = 24

