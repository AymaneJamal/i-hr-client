"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { authState, user, csrfToken } = useAppSelector((state: any) => state.auth)
  const { userRole } = usePermissions()
  const { planInfo } = usePlanFeatures()

  useEffect(() => {
    // Simple redirect - PAS de validation API
    if (authState === "NOT_AUTH") {
      router.push("/login")
      return
    }

    if (authState === "SEMI_AUTH") {
      router.push("/verify")
      return
    }
  }, [authState, router])

  // Show loading while auth state is being determined
  if (authState !== "AUTHENTICATED" || !csrfToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          {/* User context info */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Bienvenue, {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </h2>
                <p className="text-sm text-gray-500">
                  {userRole === "TENANT_ADMIN" ? "Administrateur" : 
                   userRole === "TENANT_USER" ? "Utilisateur" : "Assistant"}
                  {user.companyRole && ` • ${user.companyRole}`}
                </p>
              </div>
              
              {planInfo && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{planInfo.name}</p>
                  <p className="text-xs text-gray-500">{planInfo.category}</p>
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          {children}
        </main>
      </div>
    </div>
  )
}