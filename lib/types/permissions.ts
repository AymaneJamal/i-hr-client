// lib/types/permissions.ts

export type PermissionLevel = "READ" | "WRITE" | "DELETE" | "FORBIDDEN"

export type PermissionModule = 
  | "EMPLOYEES"
  | "TENANT_USERS" 
  | "DEPARTEMENTS"
  | "PAYROLL"
  | "REPORTS"
  | "DOCUMENTS" 
  | "ANALYTICS"
  | "RECRUITMENT"
  | "PERFORMANCE"
  | "TRAINING"
  | "LEAVE_MANAGEMENT"
  | "TIME_TRACKING"

export interface ModulePermissions {
  [key: string]: PermissionLevel[]
}

export interface PermissionCheck {
  module: PermissionModule
  level: PermissionLevel
}

export interface PermissionValidation {
  hasAccess: boolean
  hasRead: boolean
  hasWrite: boolean
  hasDelete: boolean
  isForbidden: boolean
}

export const PERMISSION_LEVELS: Record<PermissionLevel, number> = {
  FORBIDDEN: 0,
  READ: 1,
  WRITE: 2,
  DELETE: 3
}

export const DEFAULT_PERMISSIONS: Record<PermissionModule, PermissionLevel[]> = {
  EMPLOYEES: ["FORBIDDEN"],
  TENANT_USERS: ["FORBIDDEN"],
  DEPARTEMENTS: ["FORBIDDEN"],
  PAYROLL: ["FORBIDDEN"],
  REPORTS: ["FORBIDDEN"],
  DOCUMENTS: ["FORBIDDEN"],
  ANALYTICS: ["FORBIDDEN"],
  RECRUITMENT: ["FORBIDDEN"],
  PERFORMANCE: ["FORBIDDEN"],
  TRAINING: ["FORBIDDEN"],
  LEAVE_MANAGEMENT: ["FORBIDDEN"],
  TIME_TRACKING: ["FORBIDDEN"]
}