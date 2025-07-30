import { useState, useEffect, createContext, useContext } from 'react'
import api from '../lib/api'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.get('/auth/me')
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', {
      username,
      password,
    })
    const { access_token } = response.data
    localStorage.setItem('token', access_token)
    await checkAuth()
  }

  const register = async (username: string, email: string, password: string) => {
    await api.post('/auth/register', {
      username,
      email,
      password,
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 