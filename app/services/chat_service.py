import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.chat import Chat, Message
from app.models.user import User
from app.schemas.chat import ChatCreate, MessageCreate
from app.services.llm_service import LLMService
from app.services.mcp_service import MCPService
from app.services.memory_service import MemoryService
from app.services.langfuse_service import LangfuseService


class ChatService:
    def __init__(self):
        self.llm_service = LLMService()
        self.mcp_service = MCPService()
        self.memory_service = MemoryService()
        self.langfuse_service = LangfuseService()

    def create_chat(
        self, 
        chat_data: ChatCreate, 
        user_id: int, 
        db: Session
    ) -> Chat:
        """Create a new chat"""
        db_chat = Chat(
            title=chat_data.title,
            user_id=user_id,
            llm_model_id=chat_data.llm_model_id,
            mcp_server_id=chat_data.mcp_server_id
        )
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat

    def get_user_chats(self, user_id: int, db: Session) -> List[Chat]:
        """Get all chats for a user"""
        return db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.updated_at.desc()).all()

    def get_chat(self, chat_id: int, user_id: int, db: Session) -> Optional[Chat]:
        """Get a specific chat"""
        return db.query(Chat).filter(
            Chat.id == chat_id, 
            Chat.user_id == user_id
        ).first()

    async def send_message(
        self, 
        chat_id: int, 
        user_id: int, 
        message_content: str, 
        db: Session
    ) -> Dict[str, Any]:
        """Send a message and get response"""
        # Get chat
        chat = self.get_chat(chat_id, user_id, db)
        if not chat:
            raise ValueError("Chat not found")

        # Create trace ID for observability
        trace_id = str(uuid.uuid4())

        try:
            # Save user message
            user_message = Message(
                chat_id=chat_id,
                role="user",
                content=message_content
            )
            db.add(user_message)
            db.commit()

            # Get conversation history
            history = self.memory_service.get_conversation_history(chat_id, db=db)
            
            # Prepare messages for LLM
            messages = []
            for msg in history[-10:]:  # Last 10 messages for context
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": message_content
            })

            # Get LLM response
            llm_response = await self.llm_service.get_completion(
                chat.llm_model_id,
                messages,
                db
            )

            # If MCP server is configured, try to enhance response
            if chat.mcp_server_id:
                try:
                    # Call MCP server for additional context or tools
                    mcp_result = await self.mcp_service.call_mcp_server(
                        chat.mcp_server_id,
                        "process_message",
                        {
                            "message": message_content,
                            "context": history,
                            "llm_response": llm_response["content"]
                        },
                        db
                    )
                    
                    # Enhance response with MCP data if available
                    if mcp_result and "enhanced_response" in mcp_result:
                        llm_response["content"] = mcp_result["enhanced_response"]
                    
                    # Trace MCP call
                    self.langfuse_service.trace_mcp_call(
                        trace_id,
                        f"MCP Server {chat.mcp_server_id}",
                        "process_message",
                        {"message": message_content},
                        mcp_result,
                        {"chat_id": chat_id}
                    )
                except Exception as e:
                    # Log MCP error but continue with LLM response
                    self.langfuse_service.trace_error(
                        trace_id,
                        str(e),
                        "MCP_SERVER_ERROR",
                        {"chat_id": chat_id, "mcp_server_id": chat.mcp_server_id}
                    )

            # Save assistant response
            assistant_message = Message(
                chat_id=chat_id,
                role="assistant",
                content=llm_response["content"],
                metadata={
                    "model": llm_response.get("model"),
                    "provider": llm_response.get("provider"),
                    "usage": llm_response.get("usage", {}),
                    "trace_id": trace_id
                }
            )
            db.add(assistant_message)
            db.commit()

            # Update memory
            self.memory_service.add_message_to_memory(
                chat_id, "user", message_content, db=db
            )
            self.memory_service.add_message_to_memory(
                chat_id, "assistant", llm_response["content"], 
                metadata=llm_response.get("usage", {}), db=db
            )

            # Trace the chat message
            self.langfuse_service.trace_chat_message(
                trace_id,
                chat_id,
                message_content,
                llm_response["content"],
                {
                    "model": llm_response.get("model"),
                    "provider": llm_response.get("provider")
                },
                {"user_id": user_id}
            )

            return {
                "message_id": assistant_message.id,
                "content": llm_response["content"],
                "model": llm_response.get("model"),
                "provider": llm_response.get("provider"),
                "usage": llm_response.get("usage", {}),
                "trace_id": trace_id
            }

        except Exception as e:
            # Trace error
            self.langfuse_service.trace_error(
                trace_id,
                str(e),
                "CHAT_ERROR",
                {"chat_id": chat_id, "user_id": user_id}
            )
            raise

    def get_chat_messages(
        self, 
        chat_id: int, 
        user_id: int, 
        limit: int = 50, 
        db: Session = None
    ) -> List[Dict[str, Any]]:
        """Get messages for a chat"""
        chat = self.get_chat(chat_id, user_id, db)
        if not chat:
            return []
        
        return self.memory_service.get_conversation_history(chat_id, limit, db)

    def delete_chat(self, chat_id: int, user_id: int, db: Session) -> bool:
        """Delete a chat"""
        chat = self.get_chat(chat_id, user_id, db)
        if not chat:
            return False
        
        # Clear memory
        self.memory_service.clear_chat_memory(chat_id, db)
        
        # Delete chat (messages will be deleted due to cascade)
        db.delete(chat)
        db.commit()
        return True 