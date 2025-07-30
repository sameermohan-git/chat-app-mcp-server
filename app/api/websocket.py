import json
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.chat_service import ChatService
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            message_type = message_data.get("type")
            
            if message_type == "chat_message":
                await handle_chat_message(message_data, user_id, db)
            elif message_type == "typing":
                await handle_typing_indicator(message_data, user_id)
            elif message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))
        manager.disconnect(user_id)


async def handle_chat_message(message_data: Dict[str, Any], user_id: int, db: Session):
    """Handle incoming chat message"""
    try:
        chat_id = message_data.get("chat_id")
        content = message_data.get("content")
        
        if not chat_id or not content:
            return
        
        # Send typing indicator
        await manager.send_personal_message(
            json.dumps({
                "type": "typing",
                "chat_id": chat_id,
                "is_typing": True
            }),
            user_id
        )
        
        # Process message
        chat_service = ChatService()
        response = await chat_service.send_message(chat_id, user_id, content, db)
        
        # Send response
        await manager.send_personal_message(
            json.dumps({
                "type": "chat_response",
                "chat_id": chat_id,
                "message": response
            }),
            user_id
        )
        
        # Stop typing indicator
        await manager.send_personal_message(
            json.dumps({
                "type": "typing",
                "chat_id": chat_id,
                "is_typing": False
            }),
            user_id
        )
        
    except Exception as e:
        await manager.send_personal_message(
            json.dumps({
                "type": "error",
                "message": str(e)
            }),
            user_id
        )


async def handle_typing_indicator(message_data: Dict[str, Any], user_id: int):
    """Handle typing indicator"""
    chat_id = message_data.get("chat_id")
    is_typing = message_data.get("is_typing", False)
    
    # Broadcast typing indicator to other users in the same chat
    # This would need to be implemented based on your chat room logic
    pass 