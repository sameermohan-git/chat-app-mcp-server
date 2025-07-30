import httpx
import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.llm_model import LLMModel
from app.core.config import settings


class LLMService:
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None

    async def get_completion(
        self, 
        model_id: int, 
        messages: List[Dict[str, str]], 
        db: Session,
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from LLM model"""
        model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
        if not model:
            raise ValueError(f"Model with id {model_id} not found")

        if model.provider == "openai":
            return await self._get_openai_completion(model, messages, **kwargs)
        elif model.provider == "anthropic":
            return await self._get_anthropic_completion(model, messages, **kwargs)
        else:
            raise ValueError(f"Unsupported provider: {model.provider}")

    async def _get_openai_completion(
        self, 
        model: LLMModel, 
        messages: List[Dict[str, str]], 
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from OpenAI"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model.model_name,
                    "messages": messages,
                    "max_tokens": kwargs.get("max_tokens", settings.MCP_MAX_TOKENS),
                    "temperature": kwargs.get("temperature", 0.7),
                    **kwargs
                },
                timeout=settings.MCP_SERVER_TIMEOUT
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            data = response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {}),
                "model": model.model_name,
                "provider": "openai"
            }

    async def _get_anthropic_completion(
        self, 
        model: LLMModel, 
        messages: List[Dict[str, str]], 
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from Anthropic"""
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("Anthropic API key not configured")

        # Convert messages to Anthropic format
        anthropic_messages = []
        for msg in messages:
            if msg["role"] == "user":
                anthropic_messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                anthropic_messages.append({"role": "assistant", "content": msg["content"]})
            elif msg["role"] == "system":
                # Anthropic doesn't support system messages in the same way
                # We'll prepend it to the first user message
                if anthropic_messages and anthropic_messages[0]["role"] == "user":
                    anthropic_messages[0]["content"] = f"{msg['content']}\n\n{anthropic_messages[0]['content']}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": model.model_name,
                    "messages": anthropic_messages,
                    "max_tokens": kwargs.get("max_tokens", settings.MCP_MAX_TOKENS),
                    "temperature": kwargs.get("temperature", 0.7),
                    **kwargs
                },
                timeout=settings.MCP_SERVER_TIMEOUT
            )
            
            if response.status_code != 200:
                raise Exception(f"Anthropic API error: {response.text}")
            
            data = response.json()
            return {
                "content": data["content"][0]["text"],
                "usage": data.get("usage", {}),
                "model": model.model_name,
                "provider": "anthropic"
            }

    def list_models(self, db: Session) -> List[LLMModel]:
        """List all available LLM models"""
        return db.query(LLMModel).filter(LLMModel.is_active == True).all()

    def get_model(self, model_id: int, db: Session) -> Optional[LLMModel]:
        """Get specific LLM model"""
        return db.query(LLMModel).filter(LLMModel.id == model_id).first() 