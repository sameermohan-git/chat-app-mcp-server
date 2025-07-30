import json
import redis
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.chat_session import ChatSession
from app.models.chat import Chat, Message
from app.core.config import settings


class MemoryService:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)

    def get_chat_memory(self, chat_id: int, db: Session) -> Dict[str, Any]:
        """Get chat memory from database and cache"""
        # Try to get from cache first
        cache_key = f"chat_memory:{chat_id}"
        cached_memory = self.redis_client.get(cache_key)
        
        if cached_memory:
            return json.loads(cached_memory)

        # Get from database
        session = db.query(ChatSession).filter(ChatSession.chat_id == chat_id).first()
        if session and session.memory_data:
            memory_data = session.memory_data
        else:
            memory_data = {
                "context": "",
                "summary": "",
                "key_points": [],
                "conversation_history": []
            }

        # Cache the memory
        self.redis_client.setex(
            cache_key, 
            settings.CHAT_MEMORY_TTL, 
            json.dumps(memory_data)
        )
        
        return memory_data

    def update_chat_memory(
        self, 
        chat_id: int, 
        memory_data: Dict[str, Any], 
        db: Session
    ) -> None:
        """Update chat memory in database and cache"""
        # Update database
        session = db.query(ChatSession).filter(ChatSession.chat_id == chat_id).first()
        if not session:
            session = ChatSession(
                session_id=f"session_{chat_id}",
                chat_id=chat_id,
                memory_data=memory_data
            )
            db.add(session)
        else:
            session.memory_data = memory_data
        
        db.commit()

        # Update cache
        cache_key = f"chat_memory:{chat_id}"
        self.redis_client.setex(
            cache_key, 
            settings.CHAT_MEMORY_TTL, 
            json.dumps(memory_data)
        )

    def get_conversation_history(
        self, 
        chat_id: int, 
        limit: int = None, 
        db: Session = None
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a chat"""
        if not db:
            return []

        query = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at)
        
        if limit:
            query = query.limit(limit)
        
        messages = query.all()
        
        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "metadata": msg.message_metadata
            }
            for msg in messages
        ]

    def add_message_to_memory(
        self, 
        chat_id: int, 
        role: str, 
        content: str, 
        metadata: Dict[str, Any] = None,
        db: Session = None
    ) -> None:
        """Add a message to chat memory"""
        if not db:
            return

        # Get current memory
        memory = self.get_chat_memory(chat_id, db)
        
        # Add message to history
        message_entry = {
            "role": role,
            "content": content,
            "metadata": metadata or {}
        }
        
        memory["conversation_history"].append(message_entry)
        
        # Keep only recent history
        if len(memory["conversation_history"]) > settings.MAX_CHAT_HISTORY:
            memory["conversation_history"] = memory["conversation_history"][-settings.MAX_CHAT_HISTORY:]
        
        # Update memory
        self.update_chat_memory(chat_id, memory, db)

    def generate_context_summary(
        self, 
        chat_id: int, 
        db: Session
    ) -> str:
        """Generate a summary of the conversation context"""
        memory = self.get_chat_memory(chat_id, db)
        history = memory.get("conversation_history", [])
        
        if not history:
            return ""
        
        # Create a simple summary from recent messages
        recent_messages = history[-10:]  # Last 10 messages
        summary_parts = []
        
        for msg in recent_messages:
            if msg["role"] == "user":
                summary_parts.append(f"User: {msg['content'][:100]}...")
            elif msg["role"] == "assistant":
                summary_parts.append(f"Assistant: {msg['content'][:100]}...")
        
        return "\n".join(summary_parts)

    def clear_chat_memory(self, chat_id: int, db: Session) -> None:
        """Clear chat memory"""
        # Clear from database
        session = db.query(ChatSession).filter(ChatSession.chat_id == chat_id).first()
        if session:
            session.memory_data = {
                "context": "",
                "summary": "",
                "key_points": [],
                "conversation_history": []
            }
            db.commit()
        
        # Clear from cache
        cache_key = f"chat_memory:{chat_id}"
        self.redis_client.delete(cache_key) 