"""
Questions router.
Handles all question-related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import case
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate,
    QuestionAnswer,
    QuestionStatusUpdate,
    QuestionResponse,
)
from app.dependencies import get_current_user
from app.services.websocket import manager


router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


@router.get("/", response_model=List[QuestionResponse])
def get_questions(db: Session = Depends(get_db)):
    """
    Get all questions.
    
    Order:
    1. Escalated first
    2. Then Pending
    3. Then Answered
    Within each group, sorted by timestamp (newest first)
    """
    # Custom sort order: Escalated > Pending > Answered
    status_order = case(
        (Question.status == "Escalated", 1),
        (Question.status == "Pending", 2),
        (Question.status == "Answered", 3),
        else_=4
    )
    
    questions = db.query(Question).order_by(
        status_order,
        Question.timestamp.desc()
    ).all()
    
    return questions


@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new question.
    
    - Anyone can submit (no auth required)
    - Broadcasts new question to all WebSocket clients
    """
    # Validate message is not empty
    if not question_data.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question message cannot be empty"
        )
    
    # Create question
    new_question = Question(
        message=question_data.message.strip(),
        status="Pending"
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    # Broadcast to all WebSocket clients
    await manager.broadcast({
        "type": "NEW_QUESTION",
        "data": {
            "question_id": new_question.question_id,
            "message": new_question.message,
            "status": new_question.status,
            "timestamp": new_question.timestamp.isoformat(),
            "answer": new_question.answer,
            "answered_by": new_question.answered_by,
            "answered_at": None
        }
    })
    
    return new_question


@router.post("/{question_id}/answer", response_model=QuestionResponse)
async def answer_question(
    question_id: int,
    answer_data: QuestionAnswer,
    db: Session = Depends(get_db)
):
    """
    Answer a question.
    
    - Anyone can answer (no auth required)
    - Broadcasts update to all WebSocket clients
    """
    # Find question
    question = db.query(Question).filter(Question.question_id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Validate answer is not empty
    if not answer_data.answer.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer cannot be empty"
        )
    
    # Update question with answer
    question.answer = answer_data.answer.strip()
    db.commit()
    db.refresh(question)
    
    # Broadcast to all WebSocket clients
    await manager.broadcast({
        "type": "QUESTION_ANSWERED",
        "data": {
            "question_id": question.question_id,
            "answer": question.answer
        }
    })
    
    return question


@router.patch("/{question_id}/status", response_model=QuestionResponse)
async def update_status(
    question_id: int,
    status_data: QuestionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # Admin only!
):
    """
    Update question status (Admin only).
    
    - Requires valid JWT token
    - Valid statuses: "Pending", "Escalated", "Answered"
    - Broadcasts update to all WebSocket clients
    """
    # Validate status value
    valid_statuses = ["Pending", "Escalated", "Answered"]
    if status_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    # Find question
    question = db.query(Question).filter(Question.question_id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update status
    question.status = status_data.status
    
    # If marking as answered, record who answered and when
    if status_data.status == "Answered":
        question.answered_by = current_user["user_id"]
        question.answered_at = datetime.utcnow()
    
    db.commit()
    db.refresh(question)
    
    # Broadcast to all WebSocket clients
    await manager.broadcast({
        "type": "QUESTION_UPDATED",
        "data": {
            "question_id": question.question_id,
            "status": question.status,
            "answered_by": question.answered_by,
            "answered_at": question.answered_at.isoformat() if question.answered_at else None
        }
    })
    
    return question

