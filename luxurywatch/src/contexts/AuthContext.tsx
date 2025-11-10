import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '../lib/api'

// Tipos para el nuevo sistema de autenticación
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'sales' | 'user'
  phone?: string
  address?: string
  city?: string
  country?: string
  createdAt: string
  updatedAt: string
}

interface Session {
  token: string
  user: User
  expiresAt: number
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string; phone?: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  isAdmin: () => boolean
  isManager: () => boolean
  isSales: () => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token almacenado
    const checkAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const response = await api.getCurrentUser()
          if (response.success && response.user) {
            setUser(response.user)
            setSession({
              token: api.token,
              user: response.user,
              expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            })
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        // Token inválido, limpiar
        api.clearToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string; phone?: string }) => {
    try {
      setLoading(true)
      const response = await api.register({
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      })

      if (response.success) {
        setUser(response.user)
        setSession({
          token: response.token,
          user: response.user,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        })
      } else {
        throw new Error(response.message || 'Error en el registro')
      }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await api.login(email, password)

      if (response.success) {
        setUser(response.user)
        setSession({
          token: response.token,
          user: response.user,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        })
      } else {
        throw new Error(response.message || 'Credenciales inválidas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await api.logout()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error en logout:', error)
      // Incluso si hay error, limpiar localmente
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // En el futuro implementar endpoint de reset password
      const response = await api.request('/api/auth/reset-password', {
        method: 'POST',
        body: { email }
      })
      
      if (!response.success) {
        throw new Error(response.message || 'Error enviando email de reset')
      }
    } catch (error) {
      console.error('Error en reset password:', error)
      throw error
    }
  }

  // Funciones de utilidad para roles
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isManager = () => {
    return user?.role === 'manager'
  }

  const isSales = () => {
    return user?.role === 'sales'
  }

  const hasRole = (role: string) => {
    return user?.role === role
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    isManager,
    isSales,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}