import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Persist user across page refreshes via localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('devtrack_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password })
    setUser(data.user)
    localStorage.setItem('devtrack_user', JSON.stringify(data.user))
    localStorage.setItem('devtrack_token', data.token)
    return data
  }

  const register = async (name, email, password) => {
    const data = await authAPI.register({ name, email, password })
    setUser(data.user)
    localStorage.setItem('devtrack_user', JSON.stringify(data.user))
    localStorage.setItem('devtrack_token', data.token)
    return data
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('devtrack_user')
    localStorage.removeItem('devtrack_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
