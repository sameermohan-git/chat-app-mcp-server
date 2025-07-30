from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.chat_service import ChatService
from app.schemas.chat import ChatCreate, ChatResponse, MessageCreate, MessageResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
def create_chat(
    chat: ChatCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new chat"""
    chat_service = ChatService()
    db_chat = chat_service.create_chat(chat, current_user.id, db)
    return db_chat


@router.get("/", response_model=List[ChatResponse])
def get_chats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chats for current user"""
    chat_service = ChatService()
    chats = chat_service.get_user_chats(current_user.id, db)
    return chats


@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat"""
    chat_service = ChatService()
    chat = chat_service.get_chat(chat_id, current_user.id, db)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    return chat


@router.post("/{chat_id}/messages", response_model=dict)
async def send_message(
    chat_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message to a chat"""
    chat_service = ChatService()
    try:
        response = await chat_service.send_message(
            chat_id, current_user.id, message.content, db
        )
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}"
        )


@router.get("/{chat_id}/messages", response_model=List[dict])
def get_chat_messages(
    chat_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages for a chat"""
    chat_service = ChatService()
    messages = chat_service.get_chat_messages(chat_id, current_user.id, limit, db)
    return messages


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a chat"""
    chat_service = ChatService()
    success = chat_service.delete_chat(chat_id, current_user.id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    return {"message": "Chat deleted successfully"} 