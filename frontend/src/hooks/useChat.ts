import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Chat, Message } from '../types'
import toast from 'react-hot-toast'

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get('/chat/')
      return response.data as Chat[]
    },
  })
}

export function useChat(chatId: number) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await api.get(`/chat/${chatId}`)
      return response.data as Chat
    },
    enabled: !!chatId,
  })
}

export function useChatMessages(chatId: number) {
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const response = await api.get(`/chat/${chatId}/messages`)
      return response.data as Message[]
    },
    enabled: !!chatId,
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { title: string; llm_model_id: number; mcp_server_id?: number }) => {
      const response = await api.post('/chat/', data)
      return response.data as Chat
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Chat created successfully!')
    },
    onError: () => {
      toast.error('Failed to create chat')
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: number; content: string }) => {
      const response = await api.post(`/chat/${chatId}/messages`, { content })
      return response.data
    },
    onSuccess: (data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })
}

export function useDeleteChat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (chatId: number) => {
      await api.delete(`/chat/${chatId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Chat deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete chat')
    },
  })
} 