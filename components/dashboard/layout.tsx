"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { authState, user, csrfToken, permissions, plan } = useAppSelector((state: any) => state.auth)
  const { getUserRole } = usePermissions()
  const { isPlanActive, getPlanInfo } = usePlanFeatures()

  useEffect(() => {
    // Simple check without additional validation to avoid loops
    if (authState === "NOT_AUTH") {
      console.log("🚪 Dashboard: User not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    if (authState === "SEMI_AUTH") {
      console.log("🔐 Dashboard: User needs MFA verification, redirecting")
      router.push("/verify")
      return
    }

    if (authState === "AUTHENTICATED" && (!csrfToken || !user)) {
      console.log("🚨 Dashboard: Authenticated but missing CSRF or user data, redirecting to login")
      router.push("/login")
      return
    }

    console.log("✅ Dashboard: User authenticated and verified")
  }, [authState, csrfToken, user, router])

  // Show loading while auth state is being determined or if redirecting
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

  // Check if user has valid permissions and plan
  const userRole = getUserRole
  const planInfo = getPlanInfo

  // Show warnings for missing permissions or inactive plan
  const shouldShowWarnings = authState === "AUTHENTICATED"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Warnings section */}
      {shouldShowWarnings && (
        <div className="pt-20">
          {/* Plan inactive warning */}
          {!isPlanActive && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Votre plan n'est pas actif. Certaines fonctionnalités peuvent être limitées. 
                  Contactez votre administrateur.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Missing permissions warning for non-admin users */}
          {userRole !== "TENANT_ADMIN" && !permissions && (
            <div className="px-6 py-2">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Chargement de vos permissions en cours...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Plan information for reference */}
          {planInfo && process.env.NODE_ENV === 'development' && (
            <div className="px-6 py-2">
              <Alert>
                <AlertDescription>
                  <strong>Plan actuel:</strong> {planInfo.name} ({planInfo.category}) - 
                  {planInfo.maxUsers} utilisateurs, {planInfo.maxEmployees} employés
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className={shouldShowWarnings ? "flex" : "pt-20 flex"}>
        <Sidebar />
        
        {/* Main content area with proper spacing */}
        <main className="flex-1 ml-64 p-6">
          {/* Permission validation wrapper */}
          {userRole && (
            <div className="space-y-6">
              {/* User context info */}
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

              {/* Page content */}
              <div className="bg-white rounded-lg border border-gray-200 min-h-[calc(100vh-20rem)]">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}