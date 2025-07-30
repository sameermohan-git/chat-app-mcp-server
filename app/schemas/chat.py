from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatBase(BaseModel):
    title: str
    llm_model_id: Optional[int] = None
    mcp_server_id: Optional[int] = None


class ChatCreate(ChatBase):
    pass


class ChatUpdate(BaseModel):
    title: Optional[str] = None
    llm_model_id: Optional[int] = None
    mcp_server_id: Optional[int] = None


class MessageBase(BaseModel):
    role: str
    content: str
    message_metadata: Optional[Dict[str, Any]] = None


class MessageCreate(BaseModel):
    content: str
    message_metadata: Optional[Dict[str, Any]] = None


class MessageResponse(MessageBase):
    id: int
    chat_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(ChatBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True 