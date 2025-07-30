from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class MCPServerBase(BaseModel):
    name: str
    description: Optional[str] = None
    server_url: str
    server_type: str
    configuration: Optional[Dict[str, Any]] = None


class MCPServerCreate(MCPServerBase):
    pass


class MCPServerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    server_url: Optional[str] = None
    server_type: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class MCPServerResponse(MCPServerBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 