import { createContext, useContext, useState, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from '../utils/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(!!getToken())
  const [error, setError] = useState('')

  const login = useCallback(async (password) => {
    setError('')
    try {
      const { token } = await api.post('/auth/login', { password })
      setToken(token)
      setIsAuthed(true)
      return true
    } catch (err) {
      setError(err.message || 'Login failed')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setIsAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
