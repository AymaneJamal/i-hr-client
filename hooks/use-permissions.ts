// hooks/use-permissions.ts

import { useAppSelector } from "@/lib/hooks"
import type { UserPermissions, PermissionLevel } from "@/lib/types/auth"

export function usePermissions() {
  const { user, permissions, authState } = useAppSelector((state) => state.auth)

  const hasPermission = (permissionKey: string, level: PermissionLevel = "READ"): boolean => {
    if (!permissions || authState !== "AUTHENTICATED") {
      return false
    }

    // Si l'utilisateur est TENANT_ADMIN et permissions = "ALL", il a toutes les permissions
    if (user?.role === "TENANT_ADMIN" && permissions === "ALL") {
      return true
    }

    // Si permissions est une string autre que "ALL", pas de permissions
    if (typeof permissions === "string") {
      return false
    }

    // Vérifier si l'utilisateur a la permission spécifique avec le niveau requis
    const userPermissionLevels = permissions.permissions[permissionKey]
    if (!userPermissionLevels) {
      return false
    }

    return userPermissionLevels.includes(level) && !userPermissionLevels.includes("FORBIDDEN")
  }

  const hasAnyPermission = (permissionKeys: string | string[], level: PermissionLevel = "READ"): boolean => {
    // Si l'utilisateur est TENANT_ADMIN et permissions = "ALL", il a toutes les permissions
    if (user?.role === "TENANT_ADMIN" && permissions === "ALL") {
      return true
    }

    // Support both string and array
    const keys = Array.isArray(permissionKeys) ? permissionKeys : [permissionKeys]
    return keys.some(key => hasPermission(key, level))
  }

  const hasAllPermissions = (permissionKeys: string[], level: PermissionLevel = "READ"): boolean => {
    // Si l'utilisateur est TENANT_ADMIN et permissions = "ALL", il a toutes les permissions
    if (user?.role === "TENANT_ADMIN" && permissions === "ALL") {
      return true
    }

    return permissionKeys.every(key => hasPermission(key, level))
  }

  const isForbidden = (permissionKey: string): boolean => {
    if (!permissions || authState !== "AUTHENTICATED") {
      return false
    }

    // Si l'utilisateur est TENANT_ADMIN et permissions = "ALL", rien n'est interdit
    if (user?.role === "TENANT_ADMIN" && permissions === "ALL") {
      return false
    }

    // Si permissions est une string autre que "ALL", pas de permissions détaillées
    if (typeof permissions === "string") {
      return false
    }

    // Vérifier si l'utilisateur a explicitement "FORBIDDEN" pour cette permission
    const userPermissionLevels = permissions.permissions[permissionKey]
    if (!userPermissionLevels) {
      return false // Pas de permission définie = pas interdit explicitement
    }

    return userPermissionLevels.includes("FORBIDDEN")
  }

  const canWrite = (permissionKey: string): boolean => {
    return hasPermission(permissionKey, "WRITE")
  }

  const canDelete = (permissionKey: string): boolean => {
    return hasPermission(permissionKey, "DELETE")
  }

  const isAdmin = (): boolean => {
    return user?.role === "TENANT_ADMIN"
  }

  const isAuthenticated = (): boolean => {
    return authState === "AUTHENTICATED"
  }

  // Retourner la valeur directement, pas une fonction
  const getUserRole = () => {
    return user?.role || null
  }

  // Calculer userRole ici pour l'utiliser comme valeur
  const userRole = getUserRole()

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isForbidden,
    canWrite,
    canDelete,
    isAdmin,
    isAuthenticated,
    getUserRole,
    userRole, // Ajouter userRole comme valeur
    authState
  }
}