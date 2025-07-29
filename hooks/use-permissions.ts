// hooks/use-permissions.ts

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import type { PermissionModule, PermissionLevel } from "@/lib/types/permissions"
import type { UserRole } from "@/lib/types/auth"

export function usePermissions() {
  const { user, permissions } = useAppSelector((state: any) => state.auth)

  const hasPermission = useMemo(() => {
    return (module: PermissionModule, level: PermissionLevel = "READ"): boolean => {
      if (!user || !permissions) return false

      // TENANT_ADMIN has access to everything in the plan
      if (user.role === "TENANT_ADMIN") return true

      // For TENANT_USER and TENANT_HELPER, check specific permissions
      const modulePermissions = permissions.permissions[module]
      if (!modulePermissions || modulePermissions.includes("FORBIDDEN")) {
        return false
      }

      // Check if user has the required permission level
      return modulePermissions.includes(level)
    }
  }, [user, permissions])

  const hasAnyPermission = useMemo(() => {
    return (module: PermissionModule): boolean => {
      if (!user || !permissions) return false

      // TENANT_ADMIN has access to everything
      if (user.role === "TENANT_ADMIN") return true

      // Check if user has any permission (not FORBIDDEN)
      const modulePermissions = permissions.permissions[module]
      return modulePermissions && !modulePermissions.includes("FORBIDDEN")
    }
  }, [user, permissions])

  const canRead = useMemo(() => {
    return (module: PermissionModule): boolean => hasPermission(module, "READ")
  }, [hasPermission])

  const canWrite = useMemo(() => {
    return (module: PermissionModule): boolean => hasPermission(module, "WRITE")
  }, [hasPermission])

  const canDelete = useMemo(() => {
    return (module: PermissionModule): boolean => hasPermission(module, "DELETE")
  }, [hasPermission])

  const isForbidden = useMemo(() => {
    return (module: PermissionModule): boolean => {
      if (!user || !permissions) return true

      // TENANT_ADMIN is never forbidden
      if (user.role === "TENANT_ADMIN") return false

      // Check if explicitly forbidden
      const modulePermissions = permissions.permissions[module]
      return !modulePermissions || modulePermissions.includes("FORBIDDEN")
    }
  }, [user, permissions])

  const getUserRole = useMemo((): UserRole | null => {
    return user?.role || null
  }, [user])

  const getPermissionsForModule = useMemo(() => {
    return (module: PermissionModule): PermissionLevel[] => {
      if (!user || !permissions) return []

      // TENANT_ADMIN has all permissions
      if (user.role === "TENANT_ADMIN") {
        return ["READ", "WRITE", "DELETE"]
      }

      // Return actual permissions for the module
      return permissions.permissions[module] || []
    }
  }, [user, permissions])

  return {
    hasPermission,
    hasAnyPermission,
    canRead,
    canWrite,
    canDelete,
    isForbidden,
    getUserRole,
    getPermissionsForModule,
    permissions: permissions?.permissions || {},
    user
  }
}