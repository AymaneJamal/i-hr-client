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
          // MAINTENANT checkAuthStatus restaure TOUT : user, permissions, plan
          await dispatch(checkAuthStatus())
          console.log("✅ Authentication validation successful with full data")
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
          <div className="text-center justify-center">
            <div className="w-15 h-15 flex items-center justify-center mx-auto mb-2">
                          <img
                            src="/rivolio-carre.png"
                            alt="Rivolio Logo"
                            width={150}
                            height={150}
                            className="w-30 h-30 object-contain"
                          />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Rivolio
            </h2>
            <p className="text-sm text-gray-600">
              Initialisation de l'authentification...
            </p>
            <div className="flex items-center space-x-2">
              <div className="animate-spin text-center rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            </div>            
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}