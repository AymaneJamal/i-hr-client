"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch } from "@/lib/hooks"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if there's a CSRF token and user data in localStorage
        const csrfToken = localStorage.getItem("csrfToken")
        const userData = localStorage.getItem("userData")
        const userPermissions = localStorage.getItem("userPermissions")
        const userPlan = localStorage.getItem("userPlan")
        
        if (csrfToken && userData) {
          console.log("🔒 Restoring session from localStorage...")
          
          try {
            const user = JSON.parse(userData)
            const permissions = userPermissions ? JSON.parse(userPermissions) : null
            const plan = userPlan ? JSON.parse(userPlan) : null
            
            // Dispatch directement vers le store pour restaurer l'état
            dispatch({
              type: 'auth/restoreSession',
              payload: {
                user,
                permissions,
                plan,
                csrfToken,
                authState: "AUTHENTICATED"
              }
            })
            
            console.log("✅ Session restored successfully")
          } catch (parseError) {
            console.log("❌ Failed to parse stored data, clearing storage")
            localStorage.removeItem("csrfToken")
            localStorage.removeItem("userData")
            localStorage.removeItem("userPermissions")
            localStorage.removeItem("userPlan")
          }
        } else {
          console.log("❌ No valid session found")
        }
      } catch (error) {
        console.log("❌ Session restoration failed:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [dispatch])

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
              i-RH Client
            </h2>
            <p className="text-sm text-gray-600">
              Initialisation...
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