import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthSession } from '@/types'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const storedSession = localStorage.getItem('auth_session')
        if (storedSession) {
          const parsedSession: AuthSession = JSON.parse(storedSession)
          
          // Check if session is expired
          if (new Date(parsedSession.expiresAt) > new Date()) {
            setSession(parsedSession)
            setUser(parsedSession.user)
          } else {
            localStorage.removeItem('auth_session')
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('auth_session')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data: AuthSession = await response.json()
      
      setSession(data)
      setUser(data.user)
      localStorage.setItem('auth_session', JSON.stringify(data))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setSession(null)
      setUser(null)
      localStorage.removeItem('auth_session')
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data: AuthSession = await response.json()
      
      setSession(data)
      setUser(data.user)
      localStorage.setItem('auth_session', JSON.stringify(data))
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}