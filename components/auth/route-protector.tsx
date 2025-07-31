"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  const [lastValidation, setLastValidation] = useState<number>(0)
  
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
    const validateAccess = async () => {
      // Éviter les validations trop fréquentes (cooldown de 5 secondes)
      const now = Date.now()
      if (now - lastValidation < 5000) {
        console.log("🕒 RouteProtector: Validation cooldown, skipping...")
        return
      }
      
      setIsValidating(true)
      setErrorMessage(null)
      setLastValidation(now)

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

        // Validate token to ensure it's still valid
        try {
          await dispatch(validateToken({ role: user.role }))
        } catch (error) {
          console.error("Token validation failed:", error)
          setErrorMessage("Session expirée")
          router.push("/login")
          return
        }

        // Check role requirements
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          
          if (allowMultipleRoles) {
            // User must have at least one of the required roles
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
            // User must have the exact required role
            if (!roles.includes(user.role)) {
              setErrorMessage(`Accès restreint. Rôle requis: ${roles[0]}`)
              if (redirectTo) {
                router.push(redirectTo)
              } else {
                router.push("/dashboard")
              }
              return
            }
          }
        }

        // For TENANT_ADMIN, only check plan constraints
        if (user.role === "TENANT_ADMIN") {
          // Check plan feature requirement
          if (planFeature && !hasFeature(planFeature)) {
            setErrorMessage(`Fonctionnalité non disponible dans votre plan: ${planFeature}`)
            setIsAuthorized(false)
            return
          }

          // Check plan module requirement
          if (planModule && !hasModule(planModule)) {
            setErrorMessage(`Module non inclus dans votre plan: ${planModule}`)
            setIsAuthorized(false)
            return
          }

          // Check if plan is active
          if (!isPlanActive) {
            setErrorMessage("Plan inactif. Contactez l'administrateur.")
            setIsAuthorized(false)
            return
          }

          // Admin passes all checks
          setIsAuthorized(true)
          return
        }

        // For TENANT_USER and TENANT_HELPER, check permissions AND plan
        if (permission) {
          // Check if explicitly forbidden
          if (isForbidden(permission)) {
            setErrorMessage("Accès refusé. Permissions insuffisantes.")
            setIsAuthorized(false)
            return
          }

          // Check specific permission level
          if (!hasPermission(permission, level)) {
            setErrorMessage(`Permission insuffisante. Niveau requis: ${level}`)
            setIsAuthorized(false)
            return
          }

          // Check if has any access to the module
          if (!hasAnyPermission(permission)) {
            setErrorMessage("Aucune permission pour ce module.")
            setIsAuthorized(false)
            return
          }
        }

        // Check plan constraints for non-admin users
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

        if (!isPlanActive) {
          setErrorMessage("Plan inactif. Contactez l'administrateur.")
          setIsAuthorized(false)
          return
        }

        // All checks passed
        setIsAuthorized(true)

      } catch (error) {
        console.error("Route validation error:", error)
        setErrorMessage("Erreur de validation d'accès")
        setIsAuthorized(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateAccess()
  }, [
    authState, 
    csrfToken, 
    user, 
    permission, 
    level, 
    planFeature, 
    planModule, 
    requiredRole, 
    allowMultipleRoles,
    hasPermission, 
    hasAnyPermission,
    isForbidden, 
    hasFeature, 
    hasModule, 
    isPlanActive,
    dispatch, 
    router, 
    redirectTo
  ])

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