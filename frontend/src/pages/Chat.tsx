import { useState, useEffect, useRef } from 'react'
import { Send, Plus, X } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Message {
  id: number
  role: string
  content: string
  created_at: string
}

interface Chat {
  id: number
  title: string
  created_at: string
  llm_model_id?: number
  mcp_server_id?: number
}

interface LLMModel {
  id: number
  name: string
  provider: string
  model_name: string
  is_active: boolean
}

interface MCPServer {
  id: number
  name: string
  server_url: string
  server_type: string
  is_active: boolean
}

export default function Chat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<LLMModel[]>([])
  const [servers, setServers] = useState<MCPServer[]>([])
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatData, setNewChatData] = useState({
    title: 'New Chat',
    llm_model_id: undefined as number | undefined,
    mcp_server_id: undefined as number | undefined
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
    fetchModels()
    fetchServers()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat/')
      setChats(response.data)
      if (response.data.length > 0 && !selectedChat) {
        setSelectedChat(response.data[0])
      }
    } catch (error) {
      toast.error('Failed to fetch chats')
    }
  }

  const fetchModels = async () => {
    try {
      const response = await api.get('/admin/llm-models')
      setModels(response.data.filter((model: LLMModel) => model.is_active))
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }

  const fetchServers = async () => {
    try {
      const response = await api.get('/admin/mcp-servers')
      setServers(response.data.filter((server: MCPServer) => server.is_active))
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  const fetchMessages = async (chatId: number) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`)
      setMessages(response.data)
    } catch (error) {
      toast.error('Failed to fetch messages')
    }
  }

  const createNewChat = async () => {
    try {
      const response = await api.post('/chat/', newChatData)
      setChats([response.data, ...chats])
      setSelectedChat(response.data)
      setShowNewChatModal(false)
      setNewChatData({
        title: 'New Chat',
        llm_model_id: undefined,
        mcp_server_id: undefined
      })
    } catch (error) {
      toast.error('Failed to create new chat')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    setLoading(true)
    const messageToSend = newMessage
    setNewMessage('')

    try {
      const response = await api.post(`/chat/${selectedChat.id}/messages`, {
        content: messageToSend,
      })

      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: messageToSend,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, userMessage])

      // Add assistant message
      const assistantMessage: Message = {
        id: response.data.message_id,
        role: 'assistant',
        content: response.data.content,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('Failed to send message')
      setNewMessage(messageToSend) // Restore message
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full text-left p-4 hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
              }`}
            >
              <div className="font-medium text-gray-900 truncate">{chat.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(chat.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Chat</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chat Title</label>
                <input
                  type="text"
                  value={newChatData.title}
                  onChange={(e) => setNewChatData({...newChatData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter chat title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LLM Model (Optional)</label>
                <select
                  value={newChatData.llm_model_id || ''}
                  onChange={(e) => setNewChatData({...newChatData, llm_model_id: e.target.value ? Number(e.target.value) : undefined})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">No model selected</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MCP Server (Optional)</label>
                <select
                  value={newChatData.mcp_server_id || ''}
                  onChange={(e) => setNewChatData({...newChatData, mcp_server_id: e.target.value ? Number(e.target.value) : undefined})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">No server selected</option>
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} ({server.server_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createNewChat}
                disabled={!newChatData.title.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 