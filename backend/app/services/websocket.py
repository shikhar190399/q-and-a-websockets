"""
WebSocket service.
Manages WebSocket connections and broadcasts messages to all clients.
"""

from fastapi import WebSocket
from typing import List


class ConnectionManager:
    """
    Manages active WebSocket connections.
    Allows broadcasting messages to all connected clients.
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and store a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                # Client disconnected, will be cleaned up on next message
                pass


# Single instance shared across the app
manager = ConnectionManager()

