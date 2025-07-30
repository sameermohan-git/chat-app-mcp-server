import { useState, useEffect, useRef } from 'react'
import { Send, Plus } from 'lucide-react'
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
}

export default function Chat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
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
      const response = await api.post('/chat/', {
        title: 'New Chat',
        llm_model_id: 1, // Default model
      })
      setChats([response.data, ...chats])
      setSelectedChat(response.data)
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
            onClick={createNewChat}
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
    </div>
  )
} 