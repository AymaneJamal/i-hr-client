// utils/navigation-helpers.ts

import type { LucideIcon } from "lucide-react"
import type { 
  User, 
  UserPermissions, 
  Plan, 
  UserRole 
} from "@/lib/types/auth"
import type { PermissionModule } from "@/lib/types/permissions"
import { hasAnyAccess, isForbidden } from "./permission-helpers"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission?: PermissionModule
  planFeature?: keyof Plan["hrFeatures"]
  planModule?: string
  requiredRole?: UserRole[]
  children?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/**
 * Check if a navigation item should be visible
 */
export function isNavItemVisible(
  item: NavItem,
  user: User | null,
  permissions: UserPermissions | null,
  plan: Plan | null
): boolean {
  if (!user) return false

  // Check role requirement
  if (item.requiredRole && !item.requiredRole.includes(user.role)) {
    return false
  }

  // For TENANT_ADMIN, check only plan constraints
  if (user.role === "TENANT_ADMIN") {
    // Check if plan feature is required and enabled
    if (item.planFeature && plan && !plan.hrFeatures[item.planFeature]) {
      return false
    }
    
    // Check if plan module is required and included
    if (item.planModule && plan && !plan.includedModules.includes(item.planModule)) {
      return false
    }
    
    return true
  }

  // For TENANT_USER and TENANT_HELPER, check both permissions and plan
  if (item.permission) {
    // Check if forbidden
    if (isForbidden(user, permissions, item.permission)) {
      return false
    }
    
    // Check if has any access
    if (!hasAnyAccess(user, permissions, item.permission)) {
      return false
    }
  }

  // Check plan constraints
  if (item.planFeature && plan && !plan.hrFeatures[item.planFeature]) {
    return false
  }
  
  if (item.planModule && plan && !plan.includedModules.includes(item.planModule)) {
    return false
  }

  return true
}

/**
 * Filter navigation items based on user permissions and plan
 */
export function filterNavItems(
  items: NavItem[],
  user: User | null,
  permissions: UserPermissions | null,
  plan: Plan | null
): NavItem[] {
  if (!user) return []

  return items
    .filter(item => isNavItemVisible(item, user, permissions, plan))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavItems(item.children, user, permissions, plan)
        : undefined
    }))
    .filter(item => 
      // Remove items that have children but no visible children
      !item.children || item.children.length > 0
    )
}

/**
 * Filter navigation sections
 */
export function filterNavSections(
  sections: NavSection[],
  user: User | null,
  permissions: UserPermissions | null,
  plan: Plan | null
): NavSection[] {
  if (!user) return []

  return sections
    .map(section => ({
      ...section,
      items: filterNavItems(section.items, user, permissions, plan)
    }))
    .filter(section => section.items.length > 0)
}

/**
 * Get visible navigation items for a user
 */
export function getVisibleNavItems(
  allItems: NavItem[],
  user: User | null,
  permissions: UserPermissions | null,
  plan: Plan | null
): NavItem[] {
  return filterNavItems(allItems, user, permissions, plan)
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  route: string,
  navItems: NavItem[],
  user: User | null,
  permissions: UserPermissions | null,
  plan: Plan | null
): boolean {
  const findItemByRoute = (items: NavItem[], targetRoute: string): NavItem | null => {
    for (const item of items) {
      if (item.href === targetRoute) {
        return item
      }
      if (item.children) {
        const found = findItemByRoute(item.children, targetRoute)
        if (found) return found
      }
    }
    return null
  }

  const item = findItemByRoute(navItems, route)
  if (!item) return false

  return isNavItemVisible(item, user, permissions, plan)
}

/**
 * Get breadcrumb path for a route
 */
export function getBreadcrumbPath(
  route: string,
  navItems: NavItem[]
): NavItem[] {
  const findPath = (items: NavItem[], targetRoute: string, path: NavItem[] = []): NavItem[] | null => {
    for (const item of items) {
      const currentPath = [...path, item]
      
      if (item.href === targetRoute) {
        return currentPath
      }
      
      if (item.children) {
        const found = findPath(item.children, targetRoute, currentPath)
        if (found) return found
      }
    }
    return null
  }

  return findPath(navItems, route) || []
}

/**
 * Get navigation statistics for debugging
 */
export function getNavStats(
  originalItems: NavItem[],
  filteredItems: NavItem[],
  user: User | null
): {
  totalItems: number
  visibleItems: number
  hiddenItems: number
  userRole: UserRole | null
} {
  const countItems = (items: NavItem[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countItems(item.children) : 0)
    }, 0)
  }

  const totalItems = countItems(originalItems)
  const visibleItems = countItems(filteredItems)

  return {
    totalItems,
    visibleItems,
    hiddenItems: totalItems - visibleItems,
    userRole: user?.role || null
  }
}