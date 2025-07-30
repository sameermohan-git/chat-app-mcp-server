// User types
export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at?: string
}

// Chat types
export interface Chat {
  id: number
  title: string
  user_id: number
  llm_model_id: number
  mcp_server_id?: number
  created_at: string
  updated_at?: string
  messages: Message[]
}

export interface Message {
  id: number
  chat_id: number
  role: string
  content: string
  metadata?: Record<string, any>
  created_at: string
}

// LLM Model types
export interface LLMModel {
  id: number
  name: string
  provider: string
  model_name: string
  description?: string
  configuration?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at?: string
}

// MCP Server types
export interface MCPServer {
  id: number
  name: string
  description?: string
  server_url: string
  server_type: string
  configuration?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface ChatResponse {
  message_id: number
  content: string
  model: string
  provider: string
  usage: Record<string, any>
  trace_id: string
} 