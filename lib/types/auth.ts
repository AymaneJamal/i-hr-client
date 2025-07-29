// lib/types/auth.ts

export type AuthState = "NOT_AUTH" | "SEMI_AUTH" | "AUTHENTICATED"

export type UserRole = "TENANT_ADMIN" | "TENANT_USER" | "TENANT_HELPER"

export type PermissionLevel = "READ" | "WRITE" | "DELETE" | "FORBIDDEN"

export interface UserPermissions {
  userId: string
  tenantId: string
  permissions: {
    EMPLOYEES: PermissionLevel[]
    TENANT_USERS: PermissionLevel[]
    DEPARTEMENTS: PermissionLevel[]
    PAYROLL?: PermissionLevel[]
    REPORTS?: PermissionLevel[]
    DOCUMENTS?: PermissionLevel[]
    ANALYTICS?: PermissionLevel[]
    [key: string]: PermissionLevel[] | undefined
  }
  grantedBy: string
  grantedAt: number
  modifiedAt: number
}

export interface User {
  id: string | null
  email: string
  password?: string | null
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string | null
  status: string
  createdAt: number | null
  isEmailVerified: number
  companyRole: string | null
  statusModifiedAt: number | null
  modifiedAt: number | null
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number | null
  isHealperOf?: string | null
}

export interface HRFeatures {
  payroll: boolean
  recruitment: boolean
  performance_management: boolean
  employee_onboarding: boolean
  time_tracking: boolean
  leave_management: boolean
  training_management: boolean
  document_management: boolean
  reporting_analytics: boolean
  employee_self_service: boolean
}

export interface HRLimits {
  max_payslips_per_month: number
  max_job_postings: number
  max_candidates_per_month: number
  max_performance_reviews: number
  max_training_sessions: number
  max_document_uploads_per_month: number
  max_custom_reports: number
  max_api_calls_per_day: number
}

export interface Plan {
  planId: string
  planName: string
  description: string
  category: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  billingCycle: string | null
  trialPeriodDays: number | null
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  maxUsers: number
  maxEmployees: number
  maxDepartments: number
  maxProjects: number | null
  maxDocuments: number | null
  maxReports: number
  hrFeatures: HRFeatures
  hrLimits: HRLimits
  hasAdvancedReporting: boolean | null
  hasApiAccess: boolean | null
  hasCustomBranding: boolean | null
  hasMultiLanguage: boolean | null
  hasSsoIntegration: boolean | null
  hasBackupRestore: boolean | null
  hasPrioritySupport: boolean | null
  status: string
  version: string
  isPublic: number
  isRecommended: number
  createdAt: number
  modifiedAt: number | null
  createdBy: string
  modifiedBy: string | null
  autoRenewalDays: number | null
  gracePeriodDays: number
  includedModules: string[]
  customAttributes: Record<string, any>
  termsAndConditions: string
  upgradeableTo: string | null
  downgradeableTo: string | null
  requiresDataMigration: boolean | null
}

export interface AuthResponse {
  success: boolean
  message: string
  responseType: string
  data: {
    user: User
    userId: string | null
    tokenId: string | null
    jwtTokenString: string | null
    nextStep: string | null
    additionalData: {
      csrfToken: string
      permissions: UserPermissions
      plan: Plan
    }
  }
  userId: string | null
  nextStep: string
  completeSuccess: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  requiresMFA?: boolean
  requiresEmailVerification?: boolean
  user?: User
  csrfToken?: string
  permissions?: UserPermissions
  plan?: Plan
  message: string
  email?: string
  password?: string
}

export interface MFARequest {
  email: string
  password: string
  mfaCode: string
}

export interface MFAResponse {
  user: User
  csrfToken: string
  permissions: UserPermissions
  plan: Plan
  message: string
}

export interface ValidateTokenRequest {
  role: string
}

export interface ValidateTokenResponse {
  valid: boolean
  status: string
  data: {
    role: UserRole
    email: string
  }
  message: string
  newCsrfToken?: string
}

export interface RenewCsrfResponse {
  newCsrfToken: string
  message: string
}

export interface AuthSliceState {
  user: User | null
  authState: AuthState
  permissions: UserPermissions | null
  plan: Plan | null
  csrfToken: string | null
  tempEmail: string | null
  tempPassword: string | null
  loading: boolean
  error: string | null
}