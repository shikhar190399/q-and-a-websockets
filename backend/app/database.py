"""
Database configuration.
Sets up SQLAlchemy engine, session, and base model.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

# Create SQLAlchemy engine
# check_same_thread is only needed for SQLite, not PostgreSQL
if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific connection args
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL or other databases - no check_same_thread
    engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.
    
    Usage in routes:
        @router.get("/")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

