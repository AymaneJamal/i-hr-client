// lib/api/users-endpoints.ts

import { apiClient } from "@/lib/api-client"

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  companyRole: string
}

export interface DynamoUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
  status: string
  createdAt: number
  isEmailVerified: number
  companyRole: string
  statusModifiedAt: number
  modifiedAt: number
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number
  isHelperOf: string | null
  isHelpingBy: string | null
}

export interface CreateUserResponse {
  requestId: string
  data: {
    success: boolean
    dynamoUser: DynamoUser
  }
  success: boolean
  message: string
  timestamp: number
}

export interface TenantHealthCheckResponse {
  canAddUser: boolean
  message?: string
  currentUserCount?: number
  maxUsers?: number
}

export class UsersEndpoints {
  // Check if tenant can add a new user
  static async checkCanAddUser(): Promise<TenantHealthCheckResponse> {
    try {
      const response = await apiClient.get("/client/tenant-limit/can-add-user", {
        includeUserEmail: true
      })
      
      return {
        canAddUser: response.ok || response.success,
        message: response.message,
        currentUserCount: response.data?.currentUserCount,
        maxUsers: response.data?.maxUsers
      }
    } catch (error: any) {
      console.error("Tenant health check error:", error)
      return {
        canAddUser: false,
        message: error.response?.data?.message || "Impossible de vérifier les limites du tenant",
        currentUserCount: 0,
        maxUsers: 0
      }
    }
  }

  // Create a new user
  static async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiClient.post("/client/users/create", userData, {
        includeUserEmail: true
      })
      
      if (response.success) {
        return response
      }
      
      throw new Error(response.message || "Échec de la création d'utilisateur")
    } catch (error: any) {
      console.error("Create user error:", error)
      throw new Error(error.response?.data?.message || error.message || "Échec de la création d'utilisateur")
    }
  }
}