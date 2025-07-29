"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/store/auth-slice"
import { useAuthRefresh } from "@/hooks/use-auth-refresh"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useAppDispatch()
  const { authState } = useAppSelector((state: any) => state.auth)

  // Initialize auth refresh hook (handles CSRF token refresh)
  useAuthRefresh()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a CSRF token in localStorage
        const csrfToken = localStorage.getItem("csrfToken")
        
        if (csrfToken) {
          // If CSRF token exists, validate the authentication
          // The JWT cookie will be automatically sent with the request
          console.log("🔒 Found CSRF token, validating authentication...")
          await dispatch(checkAuthStatus())
          console.log("✅ Authentication validation successful")
        } else {
          console.log("❌ No CSRF token found, user not authenticated")
        }
      } catch (error) {
        // If authentication validation fails, it will be handled by the auth slice
        console.log("❌ Authentication validation failed during initialization:", error)
      } finally {
        // IMPORTANT: Always set initializing to false, even on error
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [dispatch])

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              i-RH Client
            </h2>
            <p className="text-sm text-gray-600">
              Initialisation de l'authentification...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}