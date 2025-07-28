"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type AuthState, type User, type AuthContext, mockUser, mockCredentials } from "@/lib/auth"

const AuthContextProvider = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authState, setAuthState] = useState<AuthState>("NOT_AUTH")

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("rivolio_user")
    const savedAuthState = localStorage.getItem("rivolio_auth_state")

    if (savedUser && savedAuthState) {
      setUser(JSON.parse(savedUser))
      setAuthState(savedAuthState as AuthState)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Mock authentication
    if (email === mockCredentials.email && password === mockCredentials.password) {
      setAuthState("SEMI_AUTH") // Simulate email verification needed
      setTimeout(() => {
        setUser(mockUser)
        setAuthState("AUTHENTICATED")
        localStorage.setItem("rivolio_user", JSON.stringify(mockUser))
        localStorage.setItem("rivolio_auth_state", "AUTHENTICATED")
      }, 1000) // Simulate verification delay
    } else {
      throw new Error("Identifiants invalides")
    }
  }

  const logout = () => {
    setUser(null)
    setAuthState("NOT_AUTH")
    localStorage.removeItem("rivolio_user")
    localStorage.removeItem("rivolio_auth_state")
  }

  const verifyEmail = async (code: string) => {
    // Mock email verification
    if (code === "123456") {
      setUser(mockUser)
      setAuthState("AUTHENTICATED")
      localStorage.setItem("rivolio_user", JSON.stringify(mockUser))
      localStorage.setItem("rivolio_auth_state", "AUTHENTICATED")
    } else {
      throw new Error("Code de vérification invalide")
    }
  }

  const resetPassword = async (email: string) => {
    // Mock password reset
    console.log("Password reset requested for:", email)
  }

  const setNewPassword = async (token: string, password: string) => {
    // Mock password reset
    console.log("New password set with token:", token)
  }

  return (
    <AuthContextProvider.Provider
      value={{
        user,
        authState,
        login,
        logout,
        verifyEmail,
        resetPassword,
        setNewPassword,
      }}
    >
      {children}
    </AuthContextProvider.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContextProvider)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
