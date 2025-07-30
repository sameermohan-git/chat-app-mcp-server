from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.services.llm_service import LLMService
from app.services.mcp_service import MCPService
from app.schemas.llm_model import LLMModelCreate, LLMModelUpdate, LLMModelResponse
from app.schemas.mcp_server import MCPServerCreate, MCPServerUpdate, MCPServerResponse
from app.models.llm_model import LLMModel
from app.models.mcp_server import MCPServer

router = APIRouter(prefix="/admin", tags=["admin"])


# LLM Model Management
@router.post("/llm-models", response_model=LLMModelResponse)
def create_llm_model(
    model: LLMModelCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new LLM model"""
    db_model = LLMModel(**model.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model


@router.get("/llm-models", response_model=List[LLMModelResponse])
def get_llm_models(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all LLM models"""
    models = db.query(LLMModel).all()
    return models


@router.get("/llm-models/{model_id}", response_model=LLMModelResponse)
def get_llm_model(
    model_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific LLM model"""
    model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM model not found"
        )
    return model


@router.put("/llm-models/{model_id}", response_model=LLMModelResponse)
def update_llm_model(
    model_id: int,
    model_update: LLMModelUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an LLM model"""
    db_model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not db_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM model not found"
        )
    
    update_data = model_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_model, field, value)
    
    db.commit()
    db.refresh(db_model)
    return db_model


@router.delete("/llm-models/{model_id}")
def delete_llm_model(
    model_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an LLM model"""
    db_model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not db_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM model not found"
        )
    
    db.delete(db_model)
    db.commit()
    return {"message": "LLM model deleted successfully"}


# MCP Server Management
@router.post("/mcp-servers", response_model=MCPServerResponse)
def create_mcp_server(
    server: MCPServerCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new MCP server"""
    db_server = MCPServer(**server.dict())
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    return db_server


@router.get("/mcp-servers", response_model=List[MCPServerResponse])
def get_mcp_servers(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all MCP servers"""
    servers = db.query(MCPServer).all()
    return servers


@router.get("/mcp-servers/{server_id}", response_model=MCPServerResponse)
def get_mcp_server(
    server_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific MCP server"""
    server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    return server


@router.put("/mcp-servers/{server_id}", response_model=MCPServerResponse)
def update_mcp_server(
    server_id: int,
    server_update: MCPServerUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an MCP server"""
    db_server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not db_server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    update_data = server_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_server, field, value)
    
    db.commit()
    db.refresh(db_server)
    return db_server


@router.delete("/mcp-servers/{server_id}")
def delete_mcp_server(
    server_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an MCP server"""
    db_server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
    if not db_server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCP server not found"
        )
    
    db.delete(db_server)
    db.commit()
    return {"message": "MCP server deleted successfully"}


@router.post("/mcp-servers/{server_id}/test")
async def test_mcp_server(
    server_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Test connection to MCP server"""
    mcp_service = MCPService()
    result = await mcp_service.test_server_connection(server_id, db)
    return result 