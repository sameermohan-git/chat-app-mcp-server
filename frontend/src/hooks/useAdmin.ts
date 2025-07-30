import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { LLMModel, MCPServer } from '../types'
import toast from 'react-hot-toast'

// LLM Models
export function useLLMModels() {
  return useQuery({
    queryKey: ['llm-models'],
    queryFn: async () => {
      const response = await api.get('/admin/llm-models')
      return response.data as LLMModel[]
    },
  })
}

export function useCreateLLMModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<LLMModel>) => {
      const response = await api.post('/admin/llm-models', data)
      return response.data as LLMModel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] })
      toast.success('LLM model created successfully!')
    },
    onError: () => {
      toast.error('Failed to create LLM model')
    },
  })
}

export function useUpdateLLMModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LLMModel> }) => {
      const response = await api.put(`/admin/llm-models/${id}`, data)
      return response.data as LLMModel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] })
      toast.success('LLM model updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update LLM model')
    },
  })
}

export function useDeleteLLMModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/llm-models/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] })
      toast.success('LLM model deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete LLM model')
    },
  })
}

// MCP Servers
export function useMCPServers() {
  return useQuery({
    queryKey: ['mcp-servers'],
    queryFn: async () => {
      const response = await api.get('/admin/mcp-servers')
      return response.data as MCPServer[]
    },
  })
}

export function useCreateMCPServer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<MCPServer>) => {
      const response = await api.post('/admin/mcp-servers', data)
      return response.data as MCPServer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      toast.success('MCP server created successfully!')
    },
    onError: () => {
      toast.error('Failed to create MCP server')
    },
  })
}

export function useUpdateMCPServer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MCPServer> }) => {
      const response = await api.put(`/admin/mcp-servers/${id}`, data)
      return response.data as MCPServer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      toast.success('MCP server updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update MCP server')
    },
  })
}

export function useDeleteMCPServer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/mcp-servers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      toast.success('MCP server deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete MCP server')
    },
  })
}

export function useTestMCPServer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/mcp-servers/${id}/test`)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Server connection successful!')
      } else {
        toast.error(`Server connection failed: ${data.error}`)
      }
    },
    onError: () => {
      toast.error('Failed to test server connection')
    },
  })
} 