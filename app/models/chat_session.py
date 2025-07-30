from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    memory_data = Column(JSON, nullable=True)  # Store conversation memory
    context = Column(Text, nullable=True)  # Current conversation context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chat = relationship("Chat", back_populates="chat_sessions") 