import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase.js'
import * as authService from '../services/authService.js'

const AuthContext = createContext()

function toUser(firebaseUser) {
  if (!firebaseUser) {
    return null
  }
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    username: firebaseUser.displayName,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Subscribe when the provider mounts, unsubscribe when it unmounts
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(toUser(firebaseUser))
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  async function register(email, password, username) {
    const firebaseUser = await authService.register(email, password, username)
    // onAuthStateChanged may run before updateProfile finishes, so set the user here
    setUser(toUser(firebaseUser))
  }

  async function login(email, password) {
    await authService.login(email, password)
  }

  async function logout() {
    await authService.logout()
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    authLoading,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
