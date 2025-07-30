import httpx
import json
import asyncio
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.mcp_server import MCPServer
from app.core.config import settings


class MCPService:
    def __init__(self):
        self.clients = {}

    async def connect_to_server(self, server_id: int, db: Session) -> bool:
        """Connect to MCP server"""
        server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
        if not server:
            return False

        try:
            if server.server_type == "http":
                # Test HTTP connection
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        server.server_url,
                        timeout=settings.MCP_SERVER_TIMEOUT
                    )
                    return response.status_code == 200
            elif server.server_type == "websocket":
                # Test WebSocket connection
                async with httpx.AsyncClient() as client:
                    async with client.websocket_connect(
                        server.server_url,
                        timeout=settings.MCP_SERVER_TIMEOUT
                    ) as websocket:
                        return True
            return False
        except Exception:
            return False

    async def call_mcp_server(
        self, 
        server_id: int, 
        method: str, 
        params: Dict[str, Any], 
        db: Session
    ) -> Dict[str, Any]:
        """Call MCP server method"""
        server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
        if not server:
            raise ValueError(f"MCP server with id {server_id} not found")

        if server.server_type == "http":
            return await self._call_http_server(server, method, params)
        elif server.server_type == "websocket":
            return await self._call_websocket_server(server, method, params)
        else:
            raise ValueError(f"Unsupported server type: {server.server_type}")

    async def _call_http_server(
        self, 
        server: MCPServer, 
        method: str, 
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call HTTP-based MCP server"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{server.server_url}/mcp/{method}",
                json=params,
                headers={"Content-Type": "application/json"},
                timeout=settings.MCP_SERVER_TIMEOUT
            )
            
            if response.status_code != 200:
                raise Exception(f"MCP server error: {response.text}")
            
            return response.json()

    async def _call_websocket_server(
        self, 
        server: MCPServer, 
        method: str, 
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call WebSocket-based MCP server"""
        async with httpx.AsyncClient() as client:
            async with client.websocket_connect(
                server.server_url,
                timeout=settings.MCP_SERVER_TIMEOUT
            ) as websocket:
                # Send request
                request = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": method,
                    "params": params
                }
                await websocket.send_text(json.dumps(request))
                
                # Receive response
                response_text = await websocket.receive_text()
                response = json.loads(response_text)
                
                if "error" in response:
                    raise Exception(f"MCP server error: {response['error']}")
                
                return response.get("result", {})

    def list_servers(self, db: Session) -> List[MCPServer]:
        """List all available MCP servers"""
        return db.query(MCPServer).filter(MCPServer.is_active == True).all()

    def get_server(self, server_id: int, db: Session) -> Optional[MCPServer]:
        """Get specific MCP server"""
        return db.query(MCPServer).filter(MCPServer.id == server_id).first()

    async def test_server_connection(self, server_id: int, db: Session) -> Dict[str, Any]:
        """Test connection to MCP server"""
        server = self.get_server(server_id, db)
        if not server:
            return {"success": False, "error": "Server not found"}

        try:
            is_connected = await self.connect_to_server(server_id, db)
            return {
                "success": is_connected,
                "server_name": server.name,
                "server_url": server.server_url,
                "server_type": server.server_type
            }
        except Exception as e:
            return {"success": False, "error": str(e)} 