import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, TestTube } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface LLMModel {
  id: number
  name: string
  provider: string
  model_name: string
  description: string
  is_active: boolean
}

interface MCPServer {
  id: number
  name: string
  description: string
  server_url: string
  server_type: string
  is_active: boolean
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'models' | 'servers'>('models')
  const [models, setModels] = useState<LLMModel[]>([])
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchModels()
    fetchServers()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await api.get('/admin/llm-models')
      setModels(response.data)
    } catch (error) {
      toast.error('Failed to fetch LLM models')
    }
  }

  const fetchServers = async () => {
    try {
      const response = await api.get('/admin/mcp-servers')
      setServers(response.data)
    } catch (error) {
      toast.error('Failed to fetch MCP servers')
    }
  }

  const testServer = async (serverId: number) => {
    try {
      setLoading(true)
      const response = await api.post(`/admin/mcp-servers/${serverId}/test`)
      if (response.data.success) {
        toast.success('Server connection successful!')
      } else {
        toast.error(`Server connection failed: ${response.data.error}`)
      }
    } catch (error) {
      toast.error('Failed to test server connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage LLM models and MCP servers</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            LLM Models
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'servers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            MCP Servers
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">LLM Models</h2>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </button>
          </div>

          <div className="grid gap-4">
            {models.map((model) => (
              <div key={model.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-500">{model.provider} - {model.model_name}</p>
                    {model.description && (
                      <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    model.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {model.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'servers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">MCP Servers</h2>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </button>
          </div>

          <div className="grid gap-4">
            {servers.map((server) => (
              <div key={server.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{server.name}</h3>
                    <p className="text-sm text-gray-500">{server.server_type} - {server.server_url}</p>
                    {server.description && (
                      <p className="text-sm text-gray-600 mt-1">{server.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testServer(server.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                    >
                      <TestTube className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    server.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {server.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 