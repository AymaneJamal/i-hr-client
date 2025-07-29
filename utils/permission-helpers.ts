// utils/permission-helpers.ts

import type { 
  PermissionModule, 
  PermissionLevel
} from "@/lib/types/permissions"
import type { User, UserRole, UserPermissions } from "@/lib/types/auth"

/**
 * Check if a user has a specific permission level for a module
 */
export function hasPermission(
  user: User | null,
  permissions: UserPermissions | null,
  module: PermissionModule,
  level: PermissionLevel = "READ"
): boolean {
  if (!user || !permissions) return false

  // TENANT_ADMIN has access to everything
  if (user.role === "TENANT_ADMIN") return true

  // Check specific permissions for TENANT_USER and TENANT_HELPER
  const modulePermissions = permissions.permissions[module]
  if (!modulePermissions || modulePermissions.includes("FORBIDDEN")) {
    return false
  }

  return modulePermissions.includes(level)
}

/**
 * Check if a user has any access to a module (not forbidden)
 */
export function hasAnyAccess(
  user: User | null,
  permissions: UserPermissions | null,
  module: PermissionModule
): boolean {
  if (!user || !permissions) return false

  // TENANT_ADMIN has access to everything
  if (user.role === "TENANT_ADMIN") return true

  // Check if not forbidden
  const modulePermissions = permissions.permissions[module]
  return !!(modulePermissions && !modulePermissions.includes("FORBIDDEN"))
}

/**
 * Check if a module is forbidden for a user
 */
export function isForbidden(
  user: User | null,
  permissions: UserPermissions | null,
  module: PermissionModule
): boolean {
  if (!user || !permissions) return true

  // TENANT_ADMIN is never forbidden
  if (user.role === "TENANT_ADMIN") return false

  // Check if explicitly forbidden
  const modulePermissions = permissions.permissions[module]
  return !modulePermissions || modulePermissions.includes("FORBIDDEN")
}

/**
 * Get all accessible modules for a user
 */
export function getAccessibleModules(
  user: User | null,
  permissions: UserPermissions | null
): PermissionModule[] {
  if (!user || !permissions) return []

  const allModules: PermissionModule[] = [
    "EMPLOYEES",
    "TENANT_USERS",
    "DEPARTEMENTS",
    "PAYROLL",
    "REPORTS",
    "DOCUMENTS",
    "ANALYTICS",
    "RECRUITMENT",
    "PERFORMANCE",
    "TRAINING",
    "LEAVE_MANAGEMENT",
    "TIME_TRACKING"
  ]

  // TENANT_ADMIN has access to all modules
  if (user.role === "TENANT_ADMIN") return allModules

  // Filter modules that are not forbidden
  return allModules.filter(module => 
    hasAnyAccess(user, permissions, module)
  )
}

/**
 * Get permission levels for a specific module
 */
export function getModulePermissions(
  user: User | null,
  permissions: UserPermissions | null,
  module: PermissionModule
): PermissionLevel[] {
  if (!user || !permissions) return []

  // TENANT_ADMIN has all permissions
  if (user.role === "TENANT_ADMIN") {
    return ["READ", "WRITE", "DELETE"]
  }

  // Return actual permissions for the module
  return permissions.permissions[module] || []
}

/**
 * Check if user can perform specific action
 */
export function canPerformAction(
  user: User | null,
  permissions: UserPermissions | null,
  module: PermissionModule,
  action: "view" | "create" | "edit" | "delete"
): boolean {
  const actionToPermission: Record<string, PermissionLevel> = {
    view: "READ",
    create: "WRITE",
    edit: "WRITE",
    delete: "DELETE"
  }

  const requiredPermission = actionToPermission[action]
  return hasPermission(user, permissions, module, requiredPermission)
}

/**
 * Get user role priority (higher number = more permissions)
 */
export function getRolePriority(role: UserRole): number {
  const priorities: Record<UserRole, number> = {
    TENANT_ADMIN: 3,
    TENANT_USER: 2,
    TENANT_HELPER: 1
  }
  return priorities[role] || 0
}

/**
 * Check if user has higher or equal role than required
 */
export function hasRequiredRole(
  user: User | null,
  requiredRole: UserRole
): boolean {
  if (!user) return false
  return getRolePriority(user.role) >= getRolePriority(requiredRole)
}