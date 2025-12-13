"""
Q&A Dashboard API
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

# Create FastAPI application
app = FastAPI(
    title="Q&A Dashboard API",
    description="Real-time Q&A platform with WebSocket support",
    version="1.0.0"
)

# Configure CORS
# Allows frontend (Next.js on port 3000) to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """
    Runs when the application starts.
    Creates all database tables.
    """
    # Import models to ensure they are registered with Base
    from app.models import User, Question  # noqa: F401
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created (users, questions)")


@app.get("/")
def root():
    """
    Health check endpoint.
    Returns API status.
    """
    return {
        "status": "ok",
        "message": "Q&A Dashboard API is running"
    }


# Routers will be added here later:
# app.include_router(auth.router)
# app.include_router(questions.router)
# app.include_router(websocket.router)

