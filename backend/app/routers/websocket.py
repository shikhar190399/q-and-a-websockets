"""
WebSocket router.
Handles real-time WebSocket connections for live updates.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket import manager


router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    
    Clients connect to: ws://localhost:8000/ws
    
    Messages sent to clients:
    - NEW_QUESTION: When a new question is posted
    - QUESTION_ANSWERED: When a question is answered
    - QUESTION_UPDATED: When question status changes
    
    Example message:
    {
        "type": "NEW_QUESTION",
        "data": {
            "question_id": 1,
            "message": "What is...?",
            "status": "Pending",
            ...
        }
    }
    """
    # Accept the connection and add to manager
    await manager.connect(websocket)
    
    try:
        # Keep connection alive
        while True:
            # Wait for any message from client (keeps connection open)
            # We don't process incoming messages, just keep alive
            data = await websocket.receive_text()
            # Could handle client messages here if needed in the future
            
    except WebSocketDisconnect:
        # Client disconnected
        manager.disconnect(websocket)

