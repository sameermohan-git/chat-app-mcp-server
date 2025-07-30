from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class LLMModelBase(BaseModel):
    name: str
    provider: str
    model_name: str
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None


class LLMModelCreate(LLMModelBase):
    pass


class LLMModelUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    model_name: Optional[str] = None
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class LLMModelResponse(LLMModelBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 