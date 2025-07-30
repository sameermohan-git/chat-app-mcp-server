from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class LLMModel(Base):
    __tablename__ = "llm_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    provider = Column(String, nullable=False)  # openai, anthropic, etc.
    model_name = Column(String, nullable=False)  # gpt-4, claude-3-sonnet, etc.
    description = Column(Text, nullable=True)
    configuration = Column(JSON, nullable=True)  # API keys, parameters, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 