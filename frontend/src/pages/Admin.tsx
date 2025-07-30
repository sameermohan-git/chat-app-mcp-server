import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, TestTube, X, Sun, Moon } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTheme } from '../hooks/useTheme'

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
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'models' | 'servers'>('models')
  const [models, setModels] = useState<LLMModel[]>([])
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModelModal, setShowAddModelModal] = useState(false)
  const [showAddServerModal, setShowAddServerModal] = useState(false)
  const [showEditModelModal, setShowEditModelModal] = useState(false)
  const [showEditServerModal, setShowEditServerModal] = useState(false)
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null)
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null)
  const [newModel, setNewModel] = useState({
    name: '',
    provider: '',
    model_name: '',
    description: '',
    configuration: {}
  })
  const [newServer, setNewServer] = useState({
    name: '',
    description: '',
    server_url: '',
    server_type: 'http',
    configuration: {}
  })

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

  const addModel = async () => {
    try {
      setLoading(true)
      await api.post('/admin/llm-models', newModel)
      toast.success('LLM model added successfully!')
      setShowAddModelModal(false)
      setNewModel({ name: '', provider: '', model_name: '', description: '', configuration: {} })
      fetchModels()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add LLM model')
    } finally {
      setLoading(false)
    }
  }

  const addServer = async () => {
    try {
      setLoading(true)
      await api.post('/admin/mcp-servers', newServer)
      toast.success('MCP server added successfully!')
      setShowAddServerModal(false)
      setNewServer({ name: '', description: '', server_url: '', server_type: 'http', configuration: {} })
      fetchServers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add MCP server')
    } finally {
      setLoading(false)
    }
  }

  const editModel = async () => {
    if (!editingModel) return
    try {
      setLoading(true)
      await api.put(`/admin/llm-models/${editingModel.id}`, editingModel)
      toast.success('LLM model updated successfully!')
      setShowEditModelModal(false)
      setEditingModel(null)
      fetchModels()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update LLM model')
    } finally {
      setLoading(false)
    }
  }

  const editServer = async () => {
    if (!editingServer) return
    try {
      setLoading(true)
      await api.put(`/admin/mcp-servers/${editingServer.id}`, editingServer)
      toast.success('MCP server updated successfully!')
      setShowEditServerModal(false)
      setEditingServer(null)
      fetchServers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update MCP server')
    } finally {
      setLoading(false)
    }
  }

  const deleteModel = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this LLM model?')) return
    try {
      setLoading(true)
      await api.delete(`/admin/llm-models/${modelId}`)
      toast.success('LLM model deleted successfully!')
      fetchModels()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete LLM model')
    } finally {
      setLoading(false)
    }
  }

  const deleteServer = async (serverId: number) => {
    if (!confirm('Are you sure you want to delete this MCP server?')) return
    try {
      setLoading(true)
      await api.delete(`/admin/mcp-servers/${serverId}`)
      toast.success('MCP server deleted successfully!')
      fetchServers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete MCP server')
    } finally {
      setLoading(false)
    }
  }

  const openEditModel = (model: LLMModel) => {
    setEditingModel({ ...model })
    setShowEditModelModal(true)
  }

  const openEditServer = (server: MCPServer) => {
    setEditingServer({ ...server })
    setShowEditServerModal(true)
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 dark:text-white min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage LLM models and MCP servers</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            LLM Models
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'servers'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">LLM Models</h2>
            <button 
              onClick={() => setShowAddModelModal(true)}
              className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </button>
          </div>

          <div className="grid gap-4">
            {models.map((model) => (
              <div key={model.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{model.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{model.provider} - {model.model_name}</p>
                    {model.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{model.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModel(model)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit model"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteModel(model.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete model"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    model.is_active
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">MCP Servers</h2>
            <button 
              onClick={() => setShowAddServerModal(true)}
              className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </button>
          </div>

          <div className="grid gap-4">
            {servers.map((server) => (
              <div key={server.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{server.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{server.server_type} - {server.server_url}</p>
                    {server.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{server.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testServer(server.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                      title="Test server connection"
                    >
                      <TestTube className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openEditServer(server)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit server"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteServer(server.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete server"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    server.is_active
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {server.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add LLM Model</h3>
              <button onClick={() => setShowAddModelModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newModel.name}
                  onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., GPT-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                <input
                  type="text"
                  value={newModel.provider}
                  onChange={(e) => setNewModel({...newModel, provider: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., openai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Name</label>
                <input
                  type="text"
                  value={newModel.model_name}
                  onChange={(e) => setNewModel({...newModel, model_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., gpt-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newModel.description}
                  onChange={(e) => setNewModel({...newModel, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModelModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addModel}
                disabled={loading || !newModel.name || !newModel.provider || !newModel.model_name}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Model'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      {showAddServerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add MCP Server</h3>
              <button onClick={() => setShowAddServerModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., File System Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Server URL</label>
                <input
                  type="text"
                  value={newServer.server_url}
                  onChange={(e) => setNewServer({...newServer, server_url: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., http://localhost:3001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Server Type</label>
                <select
                  value={newServer.server_type}
                  onChange={(e) => setNewServer({...newServer, server_type: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="http">HTTP</option>
                  <option value="websocket">WebSocket</option>
                  <option value="tcp">TCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newServer.description}
                  onChange={(e) => setNewServer({...newServer, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddServerModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addServer}
                disabled={loading || !newServer.name || !newServer.server_url}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Server'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {showEditModelModal && editingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit LLM Model</h3>
              <button onClick={() => setShowEditModelModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({...editingModel, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., GPT-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                <input
                  type="text"
                  value={editingModel.provider}
                  onChange={(e) => setEditingModel({...editingModel, provider: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., openai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Name</label>
                <input
                  type="text"
                  value={editingModel.model_name}
                  onChange={(e) => setEditingModel({...editingModel, model_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., gpt-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={editingModel.description}
                  onChange={(e) => setEditingModel({...editingModel, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingModel.is_active}
                    onChange={(e) => setEditingModel({...editingModel, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModelModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editModel}
                disabled={loading || !editingModel.name || !editingModel.provider || !editingModel.model_name}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Model'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Server Modal */}
      {showEditServerModal && editingServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit MCP Server</h3>
              <button onClick={() => setShowEditServerModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingServer.name}
                  onChange={(e) => setEditingServer({...editingServer, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., File System Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Server URL</label>
                <input
                  type="text"
                  value={editingServer.server_url}
                  onChange={(e) => setEditingServer({...editingServer, server_url: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., http://localhost:3001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Server Type</label>
                <select
                  value={editingServer.server_type}
                  onChange={(e) => setEditingServer({...editingServer, server_type: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="http">HTTP</option>
                  <option value="websocket">WebSocket</option>
                  <option value="tcp">TCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={editingServer.description}
                  onChange={(e) => setEditingServer({...editingServer, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingServer.is_active}
                    onChange={(e) => setEditingServer({...editingServer, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditServerModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editServer}
                disabled={loading || !editingServer.name || !editingServer.server_url}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Server'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 