"""
Q&A Dashboard API
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth_router, questions_router, websocket_router

# Create FastAPI application
app = FastAPI(
    title="Q&A Dashboard API",
    description="Real-time Q&A platform with WebSocket support",
    version="1.0.0"
)

# Configure CORS
# Allows frontend (Next.js on port 3000) to communicate with backend
# Also allows Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://q-and-a-websockets.vercel.app",  # Vercel deployment
    ],
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


# Include routers
app.include_router(auth_router)
app.include_router(questions_router)
app.include_router(websocket_router)

