"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { validateToken } from "@/lib/store/auth-slice"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import type { PermissionModule, PermissionLevel } from "@/lib/types/permissions"
import type { UserRole, HRFeatures } from "@/lib/types/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Lock, Shield, AlertTriangle, ArrowLeft } from "lucide-react"

interface RouteProtectorProps {
  children: React.ReactNode
  
  // Permission requirements
  permission?: PermissionModule
  level?: PermissionLevel
  
  // Plan requirements
  planFeature?: keyof HRFeatures
  planModule?: string
  
  // Role requirements
  requiredRole?: UserRole | UserRole[]
  allowMultipleRoles?: boolean
  
  // Behavior options
  redirectTo?: string
  showFallback?: boolean
  fallbackMessage?: string
}

export function RouteProtector({
  children,
  permission,
  level = "READ",
  planFeature,
  planModule,
  requiredRole,
  allowMultipleRoles = false,
  redirectTo,
  showFallback = true,
  fallbackMessage
}: RouteProtectorProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasValidated = useRef(false) // Pour éviter les re-validations
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, user, csrfToken } = useAppSelector((state: any) => state.auth)
  
  const { 
    hasPermission, 
    hasAnyPermission,
    isForbidden 
  } = usePermissions()
  
  const { 
    hasFeature, 
    hasModule, 
    isPlanActive 
  } = usePlanFeatures()

  useEffect(() => {
    // Éviter les re-validations multiples
    if (hasValidated.current) {
      setIsValidating(false)
      return
    }

    const validateAccess = async () => {
      setIsValidating(true)
      setErrorMessage(null)

      try {
        // First check if user is authenticated
        if (authState !== "AUTHENTICATED" || !csrfToken || !user) {
          setErrorMessage("Authentification requise")
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            router.push("/login")
          }
          return
        }

        // Check role requirements
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          
          if (allowMultipleRoles) {
            if (!roles.includes(user.role)) {
              setErrorMessage(`Rôle insuffisant. Rôles acceptés: ${roles.join(", ")}`)
              if (redirectTo) {
                router.push(redirectTo)
              } else {
                router.push("/dashboard")
              }
              return
            }
          } else {
            if (!roles.includes(user.role)) {
              setErrorMessage(`Accès restreint. Rôle requis: ${roles.join(", ")}`)
              if (redirectTo) {
                router.push(redirectTo)
              } else {
                router.push("/dashboard")
              }
              return
            }
          }
        }

        // For TENANT_ADMIN, skip permission checks but verify plan
        if (user.role === "TENANT_ADMIN") {
          if (planFeature && !hasFeature(planFeature)) {
            setErrorMessage("Fonctionnalité non disponible dans votre plan.")
            setIsAuthorized(false)
            return
          }

          if (planModule && !hasModule(planModule)) {
            setErrorMessage("Module non disponible dans votre plan.")
            setIsAuthorized(false)
            return
          }

          if (!isPlanActive()) {
            setErrorMessage("Plan inactif. Contactez l'administrateur.")
            setIsAuthorized(false)
            return
          }

          setIsAuthorized(true)
          return
        }

        // For other roles, check permissions
        if (permission) {
          if (isForbidden(permission)) {
            setErrorMessage("Accès explicitement interdit pour cette ressource.")
            setIsAuthorized(false)
            return
          }

          if (level === "READ" && !hasAnyPermission(permission)) {
            setErrorMessage(`Permission manquante: ${permission}`)
            setIsAuthorized(false)
            return
          }

          if (level !== "READ" && !hasPermission(permission, level)) {
            setErrorMessage(`Permission insuffisante: ${permission} (${level} requis)`)
            setIsAuthorized(false)
            return
          }
        }

        // Check plan requirements
        if (planFeature && !hasFeature(planFeature)) {
          setErrorMessage("Fonctionnalité non disponible dans votre plan.")
          setIsAuthorized(false)
          return
        }

        if (planModule && !hasModule(planModule)) {
          setErrorMessage("Module non disponible dans votre plan.")
          setIsAuthorized(false)
          return
        }

        if (!isPlanActive()) {
          setErrorMessage("Plan inactif. Contactez l'administrateur.")
          setIsAuthorized(false)
          return
        }

        // All checks passed
        setIsAuthorized(true)
        hasValidated.current = true // Marquer comme validé

      } catch (error) {
        console.error("Route validation error:", error)
        setErrorMessage("Erreur de validation d'accès")
        setIsAuthorized(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateAccess()
  }, [authState, csrfToken, user?.role, user?.id]) // DÉPENDANCES MINIMALES

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-sm text-gray-600">Validation des accès...</p>
        </div>
      </div>
    )
  }

  // Show error message if not authorized
  if (!isAuthorized && errorMessage) {
    if (!showFallback) {
      return null
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription className="mb-4">
              {fallbackMessage || errorMessage}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex items-center"
            >
              <Shield className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show children only if authorized
  if (isAuthorized) {
    return <>{children}</>
  }

  // Return loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="text-sm text-gray-600">Redirection...</p>
      </div>
    </div>
  )
}

// Convenience wrapper for permission-based routes
export function PermissionRoute({ 
  children, 
  permission, 
  level = "READ" 
}: { 
  children: React.ReactNode
  permission: PermissionModule
  level?: PermissionLevel 
}) {
  return (
    <RouteProtector 
      permission={permission}
      level={level}
      fallbackMessage={`Accès refusé. Permission requise: ${permission} (${level})`}
    >
      {children}
    </RouteProtector>
  )
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtector 
      requiredRole="TENANT_ADMIN"
      fallbackMessage="Cette page est réservée aux administrateurs."
    >
      {children}
    </RouteProtector>
  )
}

// Convenience wrapper for feature-based routes
export function FeatureRoute({ 
  children, 
  feature 
}: { 
  children: React.ReactNode
  feature: keyof HRFeatures 
}) {
  return (
    <RouteProtector 
      planFeature={feature}
      fallbackMessage={`Cette fonctionnalité n'est pas disponible dans votre plan: ${feature}`}
    >
      {children}
    </RouteProtector>
  )
}