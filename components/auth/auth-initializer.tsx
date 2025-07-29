"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/store/auth-slice"
import { Building2 } from "lucide-react"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a CSRF token in localStorage
        const csrfToken = localStorage.getItem("csrfToken")
        
        if (csrfToken) {
          console.log("🔒 Found CSRF token, validating authentication...")
          await dispatch(checkAuthStatus())
          console.log("✅ Authentication validation successful")
        } else {
          console.log("❌ No CSRF token found, user not authenticated")
        }
      } catch (error) {
        console.log("❌ Authentication validation failed during initialization:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    // Small delay to ensure Redux is ready
    const timer = setTimeout(() => {
      initializeAuth()
    }, 100)

    return () => clearTimeout(timer)
  }, [dispatch])

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-teal-600 text-white p-3 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
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