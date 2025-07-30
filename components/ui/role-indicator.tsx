// components/ui/role-indicator.tsx

"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { Crown, UserCheck, User, Shield, Lock } from "lucide-react"
import type { UserRole } from "@/lib/types/auth"
import type { PermissionLevel } from "@/lib/types/permissions"

interface RoleIndicatorProps {
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  showPermissionCount?: boolean
  className?: string
}

interface RoleConfig {
  label: string
  shortLabel: string
  icon: typeof Crown
  color: string
  darkColor: string
  priority: number
}

export function RoleIndicator({ 
  variant = "default",
  size = "md",
  showIcon = true,
  showPermissionCount = false,
  className 
}: RoleIndicatorProps) {
  const { user, permissions } = usePermissions()

  if (!user) {
    return (
      <Badge variant="destructive" className={cn("flex items-center space-x-1", className)}>
        <Lock className="h-3 w-3" />
        <span>Non connecté</span>
      </Badge>
    )
  }

  // Role configuration
  const roleConfig: Record<UserRole, RoleConfig> = {
    TENANT_ADMIN: {
      label: "Administrateur",
      shortLabel: "Admin",
      icon: Crown,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      darkColor: "dark:bg-purple-900 dark:text-purple-200",
      priority: 3
    },
    TENANT_USER: {
      label: "Utilisateur",
      shortLabel: "User",
      icon: UserCheck,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      darkColor: "dark:bg-blue-900 dark:text-blue-200", 
      priority: 2
    },
    TENANT_HELPER: {
      label: "Assistant",
      shortLabel: "Helper",
      icon: User,
      color: "bg-green-100 text-green-800 border-green-300",
      darkColor: "dark:bg-green-900 dark:text-green-200",
      priority: 1
    }
  }

  // Cast user.role to UserRole to fix indexing issue
  const userRole = user.role as UserRole
  const config = roleConfig[userRole]
  const Icon = config?.icon || User

  // Size configuration
  const sizeConfig = {
    sm: {
      badge: "text-xs px-2 py-1",
      icon: "h-3 w-3"
    },
    md: {
      badge: "text-sm px-3 py-1.5",
      icon: "h-4 w-4"
    },
    lg: {
      badge: "text-base px-4 py-2", 
      icon: "h-5 w-5"
    }
  }

  const sizes = sizeConfig[size]

  // Count permissions (for non-admin users) - FIXED: Check if permissions exists and has permissions property
  const permissionCount = userRole !== "TENANT_ADMIN" && permissions && permissions.permissions
    ? Object.values(permissions.permissions).filter((perms: unknown) => {
        // Type guard to check if perms is an array
        if (Array.isArray(perms)) {
          const permArray = perms as PermissionLevel[]
          return !permArray.includes("FORBIDDEN")
        }
        return false
      }).length 
    : null

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge 
        variant={variant === "default" ? undefined : variant}
        className={cn(
          "flex items-center space-x-1 border font-medium",
          sizes.badge,
          variant === "default" && config?.color,
          variant === "default" && config?.darkColor
        )}
      >
        {showIcon && <Icon className={sizes.icon} />}
        <span>{size === "sm" ? config?.shortLabel : config?.label}</span>
      </Badge>

      {showPermissionCount && permissionCount !== null && (
        <Badge variant="outline" className="text-xs">
          {permissionCount} permissions
        </Badge>
      )}
    </div>
  )
}

// Specific role indicators for common use cases
export function UserRoleBadge({ className }: { className?: string }) {
  return (
    <RoleIndicator 
      variant="outline"
      size="sm"
      showIcon={true}
      className={className}
    />
  )
}

export function AdminIndicator({ className }: { className?: string }) {
  const { user } = usePermissions()
  
  if (!user || user.role !== "TENANT_ADMIN") {
    return null
  }

  return (
    <Badge className={cn("bg-purple-500 text-white text-xs", className)}>
      <Crown className="h-3 w-3 mr-1" />
      Admin
    </Badge>
  )
}

export function RoleWithPermissions({ className }: { className?: string }) {
  return (
    <RoleIndicator 
      variant="secondary"
      size="md"
      showPermissionCount={true}
      className={className}
    />
  )
}

// Role comparison utility
export function RolePriorityIndicator({ 
  compareRole,
  className 
}: { 
  compareRole: UserRole
  className?: string 
}) {
  const { user } = usePermissions()
  
  if (!user) return null

  const roleConfig: Record<UserRole, { priority: number; color: string }> = {
    TENANT_ADMIN: { priority: 3, color: "bg-purple-500" },
    TENANT_USER: { priority: 2, color: "bg-blue-500" },
    TENANT_HELPER: { priority: 1, color: "bg-green-500" }
  }

  // Cast to UserRole to fix indexing
  const userRole = user.role as UserRole
  const userPriority = roleConfig[userRole]?.priority || 0
  const comparePriority = roleConfig[compareRole]?.priority || 0

  if (userPriority <= comparePriority) {
    return null
  }

  return (
    <Badge className={cn("text-xs", roleConfig[userRole]?.color, className)}>
      <Shield className="h-3 w-3 mr-1" />
      Privilèges supérieurs
    </Badge>
  )
}

// Permission level indicator
export function PermissionLevelBadge({ 
  module,
  className 
}: { 
  module: string
  className?: string 
}) {
  const { permissions, user } = usePermissions()
  
  if (!user || !permissions) return null

  // Admin has all permissions
  if (user.role === "TENANT_ADMIN") {
    return (
      <Badge className={cn("bg-purple-100 text-purple-800 text-xs", className)}>
        <Crown className="h-3 w-3 mr-1" />
        Accès complet
      </Badge>
    )
  }

  // FIXED: Check if permissions object exists
  const modulePermissions = permissions.permissions ? permissions.permissions[module] : null
  
  // Type guard and cast
  if (!modulePermissions || !Array.isArray(modulePermissions)) {
    return (
      <Badge variant="destructive" className={cn("text-xs", className)}>
        <Lock className="h-3 w-3 mr-1" />
        Accès refusé
      </Badge>
    )
  }

  const permArray = modulePermissions as PermissionLevel[]
  
  if (permArray.includes("FORBIDDEN")) {
    return (
      <Badge variant="destructive" className={cn("text-xs", className)}>
        <Lock className="h-3 w-3 mr-1" />
        Accès refusé
      </Badge>
    )
  }

  const hasDelete = permArray.includes("DELETE")
  const hasWrite = permArray.includes("WRITE") 
  const hasRead = permArray.includes("READ")

  let level = "Aucun"
  let color = "bg-gray-100 text-gray-800"

  if (hasDelete) {
    level = "Suppression"
    color = "bg-red-100 text-red-800"
  } else if (hasWrite) {
    level = "Écriture" 
    color = "bg-yellow-100 text-yellow-800"
  } else if (hasRead) {
    level = "Lecture"
    color = "bg-green-100 text-green-800"
  }

  return (
    <Badge className={cn(color, "text-xs", className)}>
      {level}
    </Badge>
  )
}