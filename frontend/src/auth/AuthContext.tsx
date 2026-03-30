import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'

type AuthContextValue = {
  token: string | null
  email: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'cc_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { token: string; email: string }
      setToken(parsed.token)
      setEmail(parsed.email)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const persist = (newToken: string, newEmail: string) => {
    setToken(newToken)
    setEmail(newEmail)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, email: newEmail }))
  }

  const login = async (userEmail: string, password: string) => {
    const response = await authApi.login(userEmail, password)
    persist(response.accessToken, response.email)
  }

  const register = async (userEmail: string, password: string) => {
    const response = await authApi.register(userEmail, password)
    persist(response.accessToken, response.email)
  }

  const logout = () => {
    setToken(null)
    setEmail(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, email],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
