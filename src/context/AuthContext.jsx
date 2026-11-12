import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SESSION_KEY, USERS_KEY } from '../lib/constants.js'
import { loadJson } from '../lib/storage.js'

const AuthContext = createContext(null)

function readUsers() {
  const loaded = loadJson(USERS_KEY, [])
  if (!Array.isArray(loaded)) return []
  return loaded.filter((user) => user && typeof user.email === 'string' && typeof user.password === 'string')
}

function publicUser(record) {
  if (!record) return null
  return { name: record.name, email: record.email }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(readUsers)
  const [user, setUser] = useState(() => {
    const email = loadJson(SESSION_KEY, null)
    if (typeof email !== 'string') return null
    return publicUser(readUsers().find((record) => record.email === email))
  })

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user.email))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const value = useMemo(() => {
    function signup({ name, email, password }) {
      const record = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }
      if (users.some((account) => account.email === record.email)) {
        return { ok: false, error: 'That email already holds a paper account.' }
      }
      setUsers((prev) => [...prev, record])
      setUser({ name: record.name, email: record.email })
      return { ok: true }
    }

    function login({ email, password }) {
      const normalized = email.trim().toLowerCase()
      const found = users.find((account) => account.email === normalized && account.password === password)
      if (!found) return { ok: false, error: 'Those credentials do not match a paper account.' }
      setUser({ name: found.name, email: found.email })
      return { ok: true }
    }

    function logout() {
      setUser(null)
    }

    return { user, users, signup, login, logout }
  }, [user, users])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
