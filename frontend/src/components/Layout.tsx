import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MessageSquare, Settings, LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Chat App MCP Server
              </h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/chat"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/chat'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>
              
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
              
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 