from langfuse import Langfuse
from typing import Dict, Any, Optional
from app.core.config import settings


class LangfuseService:
    def __init__(self):
        if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
            self.langfuse = Langfuse(
                public_key=settings.LANGFUSE_PUBLIC_KEY,
                secret_key=settings.LANGFUSE_SECRET_KEY,
                host=settings.LANGFUSE_HOST
            )
        else:
            self.langfuse = None

    def trace_generation(
        self,
        trace_id: str,
        name: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        metadata: Dict[str, Any] = None
    ) -> None:
        """Trace a generation event"""
        if not self.langfuse:
            return

        try:
            trace = self.langfuse.trace(
                id=trace_id,
                name=name,
                metadata=metadata or {}
            )

            generation = trace.generation(
                name=name,
                input=input_data,
                output=output_data,
                metadata=metadata or {}
            )

            generation.flush()
        except Exception as e:
            print(f"Langfuse tracing error: {e}")

    def trace_chat_message(
        self,
        trace_id: str,
        chat_id: int,
        user_message: str,
        assistant_response: str,
        model_info: Dict[str, Any],
        metadata: Dict[str, Any] = None
    ) -> None:
        """Trace a chat message exchange"""
        if not self.langfuse:
            return

        try:
            trace = self.langfuse.trace(
                id=trace_id,
                name=f"Chat Message - {chat_id}",
                metadata={
                    "chat_id": chat_id,
                    "model": model_info.get("model"),
                    "provider": model_info.get("provider"),
                    **(metadata or {})
                }
            )

            # Trace user input
            trace.span(
                name="User Input",
                input={"message": user_message},
                metadata={"role": "user"}
            )

            # Trace assistant response
            trace.span(
                name="Assistant Response",
                input={"message": user_message},
                output={"response": assistant_response},
                metadata={
                    "role": "assistant",
                    "model": model_info.get("model"),
                    "provider": model_info.get("provider")
                }
            )

            trace.flush()
        except Exception as e:
            print(f"Langfuse tracing error: {e}")

    def trace_mcp_call(
        self,
        trace_id: str,
        server_name: str,
        method: str,
        input_params: Dict[str, Any],
        output_result: Dict[str, Any],
        metadata: Dict[str, Any] = None
    ) -> None:
        """Trace an MCP server call"""
        if not self.langfuse:
            return

        try:
            trace = self.langfuse.trace(
                id=trace_id,
                name=f"MCP Call - {server_name}",
                metadata={
                    "server_name": server_name,
                    "method": method,
                    **(metadata or {})
                }
            )

            trace.span(
                name=f"MCP {method}",
                input=input_params,
                output=output_result,
                metadata={
                    "server_name": server_name,
                    "method": method
                }
            )

            trace.flush()
        except Exception as e:
            print(f"Langfuse tracing error: {e}")

    def trace_error(
        self,
        trace_id: str,
        error_message: str,
        error_type: str,
        metadata: Dict[str, Any] = None
    ) -> None:
        """Trace an error event"""
        if not self.langfuse:
            return

        try:
            trace = self.langfuse.trace(
                id=trace_id,
                name="Error",
                metadata={
                    "error_type": error_type,
                    **(metadata or {})
                }
            )

            trace.span(
                name="Error",
                level="ERROR",
                input={"error_message": error_message},
                metadata={
                    "error_type": error_type
                }
            )

            trace.flush()
        except Exception as e:
            print(f"Langfuse tracing error: {e}")

    def is_enabled(self) -> bool:
        """Check if Langfuse is enabled"""
        return self.langfuse is not None 