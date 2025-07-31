"use client"

import type React from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import type { PermissionModule, PermissionLevel } from "@/lib/types/permissions"
import type { UserRole, HRFeatures } from "@/lib/types/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Lock, Crown } from "lucide-react"

interface PermissionGuardProps {
  children: React.ReactNode
  
  // Permission requirements
  permission?: PermissionModule
  level?: PermissionLevel
  
  // Plan requirements
  planFeature?: keyof HRFeatures
  planModule?: string
  
  // Role requirements
  requiredRole?: UserRole | UserRole[]
  
  // Behavior options
  fallback?: React.ReactNode
  showMessage?: boolean
  redirectTo?: string
}

export function PermissionGuard({
  children,
  permission,
  level = "READ",
  planFeature,
  planModule,
  requiredRole,
  fallback,
  showMessage = true
}: PermissionGuardProps) {
  const { 
    user, 
    hasPermission, 
    hasAnyPermission, 
    isForbidden 
  } = usePermissions()
  
  const { 
    hasFeature, 
    hasModule, 
    isPlanActive 
  } = usePlanFeatures()

  // Check if user exists
  if (!user) {
    return showMessage ? (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à cette section.
        </AlertDescription>
      </Alert>
    ) : (fallback || null)
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(user.role as UserRole)) {
      return showMessage ? (
        <Alert variant="destructive">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les privilèges nécessaires pour accéder à cette section.
            Rôle requis: {roles.join(" ou ")}
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }
  }

  // For TENANT_ADMIN, only check plan constraints
  if (user.role === "TENANT_ADMIN") {
    // Check plan feature requirement
    if (planFeature && !hasFeature(planFeature)) {
      return showMessage ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cette fonctionnalité n'est pas incluse dans votre plan actuel.
            Fonctionnalité requise: {planFeature}
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }

    // Check plan module requirement
    if (planModule && !hasModule(planModule)) {
      return showMessage ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ce module n'est pas inclus dans votre plan actuel.
            Module requis: {planModule}
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }

    // Check if plan is active
    if (!isPlanActive) {
      return showMessage ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Votre plan n'est pas actif. Contactez l'administrateur.
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }

    // TENANT_ADMIN passes all permission checks
    return <>{children}</>
  }

  // For TENANT_USER and TENANT_HELPER, check permissions AND plan
  if (permission) {
    // Check if explicitly forbidden
    if (isForbidden(permission)) {
      return showMessage ? (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Vous n'avez pas les permissions nécessaires.
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }

    // Check specific permission level
    if (!hasPermission(permission, level)) {
      return showMessage ? (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Permission insuffisante. Niveau requis: {level}
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }

    // Check if has any access to the module
    if (!hasAnyPermission(permission)) {
      return showMessage ? (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Aucune permission pour accéder à ce module.
          </AlertDescription>
        </Alert>
      ) : (fallback || null)
    }
  }

  // Check plan constraints for non-admin users
  if (planFeature && !hasFeature(planFeature)) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Cette fonctionnalité n'est pas disponible dans votre plan.
        </AlertDescription>
      </Alert>
    ) : (fallback || null)
  }

  if (planModule && !hasModule(planModule)) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Ce module n'est pas disponible dans votre plan.
        </AlertDescription>
      </Alert>
    ) : (fallback || null)
  }

  if (!isPlanActive) {
    return showMessage ? (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Votre plan n'est pas actif. Contactez l'administrateur.
        </AlertDescription>
      </Alert>
    ) : (fallback || null)
  }

  // All checks passed, render children
  return <>{children}</>
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      requiredRole="TENANT_ADMIN" 
      fallback={fallback}
      showMessage={false}
    >
      {children}
    </PermissionGuard>
  )
}

export function RequirePermission({ 
  children, 
  permission, 
  level = "READ",
  fallback 
}: { 
  children: React.ReactNode
  permission: PermissionModule
  level?: PermissionLevel
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      permission={permission} 
      level={level}
      fallback={fallback}
      showMessage={false}
    >
      {children}
    </PermissionGuard>
  )
}

export function RequireFeature({ 
  children, 
  feature, 
  fallback 
}: { 
  children: React.ReactNode
  feature: keyof HRFeatures
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      planFeature={feature}
      fallback={fallback}
      showMessage={false}
    >
      {children}
    </PermissionGuard>
  )
}