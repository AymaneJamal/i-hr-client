// lib/api/auth-endpoints.ts

import { apiClient } from "@/lib/api-client"
import type {
  LoginRequest,
  LoginResponse,
  MFARequest,
  MFAResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RenewCsrfResponse,
  AuthResponse
} from "@/lib/types/auth"

export class AuthEndpoints {
  // Login initial
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post("/api/auth/tenant/login", credentials)
      
      if (response.data.success) {
        const authData = response.data as AuthResponse
        
        // Check if MFA is required
        if (authData.data.user.isMfaRequired === 1) {
          return {
            requiresMFA: true,
            email: credentials.email,
            password: credentials.password,
            message: authData.message
          }
        }
        
        // Check if email verification is required
        if (authData.data.user.isEmailVerified === 0) {
          return {
            requiresEmailVerification: true,
            email: credentials.email,
            password: credentials.password,
            message: "Email verification required"
          }
        }
        
        // Direct authentication success
        return {
          user: authData.data.user,
          csrfToken: authData.data.additionalData.csrfToken,
          permissions: authData.data.additionalData.permissions,
          plan: authData.data.additionalData.plan,
          message: authData.message
        }
      }
      
      throw new Error(response.data.message || "Login failed")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Login failed")
    }
  }

  // MFA Verification
  static async verifyMFA(mfaData: MFARequest): Promise<MFAResponse> {
    try {
      const response = await apiClient.post("/api/auth/tenant/login/mfa", mfaData)
      
      if (response.data.success && response.data.responseType === "SUCCESS") {
        const authData = response.data as AuthResponse
        
        return {
          user: authData.data.user,
          csrfToken: authData.data.additionalData.csrfToken,
          permissions: authData.data.additionalData.permissions,
          plan: authData.data.additionalData.plan,
          message: authData.message
        }
      }
      
      throw new Error(response.data.message || "MFA verification failed")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "MFA verification failed")
    }
  }

  // Email Verification
  static async verifyEmail(email: string, verificationCode: string): Promise<MFAResponse> {
    try {
      const response = await apiClient.post("/api/auth/tenant/verify-email", {
        email,
        verificationCode
      })
      
      if (response.data.success && response.data.responseType === "SUCCESS") {
        const authData = response.data as AuthResponse
        
        return {
          user: authData.data.user,
          csrfToken: authData.data.additionalData.csrfToken,
          permissions: authData.data.additionalData.permissions,
          plan: authData.data.additionalData.plan,
          message: authData.message
        }
      }
      
      throw new Error(response.data.message || "Email verification failed")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Email verification failed")
    }
  }

  // Resend MFA Code
  static async resendMFACode(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/api/auth/tenant/resend-mfa", { email })
      return { message: response.data.message || "MFA code sent" }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to resend MFA code")
    }
  }

  // Resend Email Verification Code
  static async resendEmailVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/api/auth/tenant/resend-email-verification", { email })
      return { message: response.data.message || "Verification code sent" }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to resend verification code")
    }
  }

  // Validate Token
  static async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const response = await apiClient.post("/api/auth/tenant/validate/token", data)
      
      if (response.data.valid && response.data.status === "AUTHORIZED") {
        return {
          valid: true,
          status: response.data.status,
          data: response.data.data,
          message: response.data.message,
          newCsrfToken: response.data.newCsrfToken
        }
      }
      
      throw new Error(response.data.message || "Token validation failed")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Token validation failed")
    }
  }

  // Renew CSRF Token
  static async renewCsrfToken(): Promise<string> {
    try {
      const response = await apiClient.post("/api/auth/tenant/renew-csrf")
      
      if (response.data.success) {
        return response.data.newCsrfToken
      }
      
      throw new Error(response.data.message || "CSRF renewal failed")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "CSRF renewal failed")
    }
  }

  // Logout
  static async logout(): Promise<{ success: boolean }> {
    try {
      await apiClient.post("/api/auth/tenant/logout")
      return { success: true }
    } catch (error: any) {
      // Even if logout fails on server, return success to clear local state
      return { success: true }
    }
  }

  // Forgot Password
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/api/auth/tenant/forgot-password", { email })
      return { message: response.data.message || "Password reset email sent" }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to send reset email")
    }
  }

  // Reset Password
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/api/auth/tenant/reset-password", {
        token,
        newPassword
      })
      return { message: response.data.message || "Password reset successful" }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Password reset failed")
    }
  }
}