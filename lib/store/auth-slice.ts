// lib/store/auth-slice.ts

import { AuthEndpoints } from "@/lib/api/auth-endpoints"
import type {
  AuthSliceState,
  LoginRequest,
  ValidateTokenRequest,
  UserRole
} from "@/lib/types/auth"

// Action types
const AUTH_ACTIONS = {
  // Login
  LOGIN_PENDING: 'auth/loginUser/pending',
  LOGIN_FULFILLED: 'auth/loginUser/fulfilled',
  LOGIN_REJECTED: 'auth/loginUser/rejected',
  
  // MFA
  MFA_PENDING: 'auth/verifyMFA/pending',
  MFA_FULFILLED: 'auth/verifyMFA/fulfilled',
  MFA_REJECTED: 'auth/verifyMFA/rejected',
  
  // Email verification
  EMAIL_PENDING: 'auth/verifyEmail/pending',
  EMAIL_FULFILLED: 'auth/verifyEmail/fulfilled',
  EMAIL_REJECTED: 'auth/verifyEmail/rejected',
  
  // Token validation
  VALIDATE_FULFILLED: 'auth/checkAuthStatus/fulfilled',
  VALIDATE_REJECTED: 'auth/checkAuthStatus/rejected',
  
  // CSRF renewal
  CSRF_FULFILLED: 'auth/renewCsrfToken/fulfilled',
  
  // Logout
  LOGOUT_FULFILLED: 'auth/logout/fulfilled',
  
  // Resend codes
  RESEND_MFA_PENDING: 'auth/resendMFACode/pending',
  RESEND_MFA_FULFILLED: 'auth/resendMFACode/fulfilled',
  RESEND_MFA_REJECTED: 'auth/resendMFACode/rejected',
  
  RESEND_EMAIL_PENDING: 'auth/resendEmailVerification/pending',
  RESEND_EMAIL_FULFILLED: 'auth/resendEmailVerification/fulfilled',
  RESEND_EMAIL_REJECTED: 'auth/resendEmailVerification/rejected',
  
  // Password reset
  FORGOT_PENDING: 'auth/forgotPassword/pending',
  FORGOT_FULFILLED: 'auth/forgotPassword/fulfilled',
  FORGOT_REJECTED: 'auth/forgotPassword/rejected',
  
  RESET_PENDING: 'auth/resetPassword/pending',
  RESET_FULFILLED: 'auth/resetPassword/fulfilled',
  RESET_REJECTED: 'auth/resetPassword/rejected',
  
  // Sync actions
  CLEAR_ERROR: 'auth/clearError',
  UPDATE_CSRF_TOKEN: 'auth/updateCsrfToken',
  CLEAR_TEMP_CREDENTIALS: 'auth/clearTempCredentials'
} as const

const initialState: AuthSliceState = {
  user: null,
  authState: "NOT_AUTH",
  permissions: null,
  plan: null,
  csrfToken: null,
  tempEmail: null,
  tempPassword: null,
  loading: false,
  error: null
}

// Simple action creators
const createAction = (type: string) => (payload?: any) => ({ type, payload })

// Action creators
export const clearError = createAction(AUTH_ACTIONS.CLEAR_ERROR)
export const updateCsrfToken = createAction(AUTH_ACTIONS.UPDATE_CSRF_TOKEN)
export const clearTempCredentials = createAction(AUTH_ACTIONS.CLEAR_TEMP_CREDENTIALS)

// Async action creators (thunks)
export const loginUser = (credentials: LoginRequest) => async (dispatch: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.LOGIN_PENDING })
    const response = await AuthEndpoints.login(credentials)
    dispatch({ type: AUTH_ACTIONS.LOGIN_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.LOGIN_REJECTED, payload: error.message })
    throw error
  }
}

export const verifyMFA = (code: string) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.MFA_PENDING })
    
    const state = getState()
    const { tempEmail, tempPassword } = state.auth
    
    if (!tempEmail || !tempPassword) {
      throw new Error("Session expired. Please login again.")
    }
    
    const response = await AuthEndpoints.verifyMFA({
      email: tempEmail,
      password: tempPassword,
      mfaCode: code
    })
    
    dispatch({ type: AUTH_ACTIONS.MFA_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.MFA_REJECTED, payload: error.message })
    throw error
  }
}

export const verifyEmail = (code: string) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.EMAIL_PENDING })
    
    const state = getState()
    const { tempEmail } = state.auth
    
    if (!tempEmail) {
      throw new Error("Session expired. Please login again.")
    }
    
    const response = await AuthEndpoints.verifyEmail(tempEmail, code)
    dispatch({ type: AUTH_ACTIONS.EMAIL_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.EMAIL_REJECTED, payload: error.message })
    throw error
  }
}

export const validateToken = (data: ValidateTokenRequest) => async (dispatch: any) => {
  try {
    const response = await AuthEndpoints.validateToken(data)
    
    // Update CSRF token if new one provided
    if (response.newCsrfToken) {
      dispatch(updateCsrfToken(response.newCsrfToken))
    }
    
    return response
  } catch (error: any) {
    // Handle CSRF validation failure
    if (error.message === "CSRF validation failed") {
      console.log("🔄 CSRF validation failed, attempting to renew CSRF token...")
      
      try {
        const newCsrfToken = await dispatch(renewCsrfToken())
        
        // Retry validation with new CSRF token
        const retryResponse = await AuthEndpoints.validateToken(data)
        return retryResponse
      } catch (renewError: any) {
        console.error("❌ CSRF renewal failed:", renewError)
        throw new Error("JWT_INVALID")
      }
    }
    
    throw error
  }
}

export const renewCsrfToken = () => async (dispatch: any) => {
  try {
    const newCsrfToken = await AuthEndpoints.renewCsrfToken()
    dispatch({ type: AUTH_ACTIONS.CSRF_FULFILLED, payload: newCsrfToken })
    return newCsrfToken
  } catch (error: any) {
    throw error
  }
}

export const checkAuthStatus = () => async (dispatch: any) => {
  try {
    const csrfToken = localStorage.getItem("csrfToken")
    
    if (!csrfToken) {
      throw new Error("No CSRF token found")
    }
    
    // Try TENANT_ADMIN first, then fallback to others
    const roles: UserRole[] = ["TENANT_ADMIN", "TENANT_USER", "TENANT_HELPER"]
    
    for (const role of roles) {
      try {
        const response = await dispatch(validateToken({ role }))
        
        const user = {
          id: null,
          email: response.data.email,
          password: null,
          firstName: "User",
          lastName: "Name",
          role: response.data.role,
          tenantId: null,
          status: "ACTIVE",
          createdAt: null,
          isEmailVerified: 1,
          companyRole: null,
          statusModifiedAt: null,
          modifiedAt: null,
          isMfaRequired: 0,
          secretCodeMFA: null,
          lastLoginAt: Date.now(),
          failedLoginAttempts: null
        }
        
        const result = { 
          user, 
          csrfToken: response.newCsrfToken || csrfToken,
          role: response.data.role
        }
        
        dispatch({ type: AUTH_ACTIONS.VALIDATE_FULFILLED, payload: result })
        return result
      } catch (roleError) {
        // Continue to next role if this one fails
        continue
      }
    }
    
    throw new Error("No valid role found")
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.VALIDATE_REJECTED, payload: "Authentication validation failed" })
    throw error
  }
}

export const logout = () => async (dispatch: any) => {
  try {
    await AuthEndpoints.logout()
    dispatch({ type: AUTH_ACTIONS.LOGOUT_FULFILLED, payload: { success: true } })
    return { success: true }
  } catch (error: any) {
    // Even if logout fails on server, clear local state
    dispatch({ type: AUTH_ACTIONS.LOGOUT_FULFILLED, payload: { success: true } })
    return { success: true }
  }
}

export const resendMFACode = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.RESEND_MFA_PENDING })
    
    const state = getState()
    const { tempEmail } = state.auth
    
    if (!tempEmail) {
      throw new Error("Email not found. Please login again.")
    }
    
    const response = await AuthEndpoints.resendMFACode(tempEmail)
    dispatch({ type: AUTH_ACTIONS.RESEND_MFA_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.RESEND_MFA_REJECTED, payload: error.message })
    throw error
  }
}

export const resendEmailVerification = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.RESEND_EMAIL_PENDING })
    
    const state = getState()
    const { tempEmail } = state.auth
    
    if (!tempEmail) {
      throw new Error("Email not found. Please login again.")
    }
    
    const response = await AuthEndpoints.resendEmailVerification(tempEmail)
    dispatch({ type: AUTH_ACTIONS.RESEND_EMAIL_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.RESEND_EMAIL_REJECTED, payload: error.message })
    throw error
  }
}

export const forgotPassword = (email: string) => async (dispatch: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.FORGOT_PENDING })
    const response = await AuthEndpoints.forgotPassword(email)
    dispatch({ type: AUTH_ACTIONS.FORGOT_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.FORGOT_REJECTED, payload: error.message })
    throw error
  }
}

export const resetPassword = ({ token, newPassword }: { token: string; newPassword: string }) => async (dispatch: any) => {
  try {
    dispatch({ type: AUTH_ACTIONS.RESET_PENDING })
    const response = await AuthEndpoints.resetPassword(token, newPassword)
    dispatch({ type: AUTH_ACTIONS.RESET_FULFILLED, payload: response })
    return response
  } catch (error: any) {
    dispatch({ type: AUTH_ACTIONS.RESET_REJECTED, payload: error.message })
    throw error
  }
}

// Reducer
const authReducer = (state = initialState, action: any): AuthSliceState => {
  switch (action.type) {
    // Login
    case AUTH_ACTIONS.LOGIN_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.LOGIN_FULFILLED:
      if (action.payload.requiresMFA) {
        return {
          ...state,
          loading: false,
          authState: "SEMI_AUTH",
          tempEmail: action.payload.email || null,
          tempPassword: action.payload.password || null
        }
      } else if (action.payload.requiresEmailVerification) {
        return {
          ...state,
          loading: false,
          authState: "SEMI_AUTH",
          tempEmail: action.payload.email || null,
          tempPassword: action.payload.password || null
        }
      } else {
        if (action.payload.csrfToken) {
          localStorage.setItem("csrfToken", action.payload.csrfToken)
        }
        return {
          ...state,
          loading: false,
          authState: "AUTHENTICATED",
          user: action.payload.user || null,
          permissions: action.payload.permissions || null,
          plan: action.payload.plan || null,
          csrfToken: action.payload.csrfToken || null
        }
      }
    case AUTH_ACTIONS.LOGIN_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload || "Login failed"
      }

    // MFA Verification
    case AUTH_ACTIONS.MFA_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.MFA_FULFILLED:
      localStorage.setItem("csrfToken", action.payload.csrfToken)
      return {
        ...state,
        loading: false,
        authState: "AUTHENTICATED",
        user: action.payload.user,
        permissions: action.payload.permissions,
        plan: action.payload.plan,
        csrfToken: action.payload.csrfToken,
        tempEmail: null,
        tempPassword: null
      }
    case AUTH_ACTIONS.MFA_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload || "MFA verification failed"
      }

    // Email Verification
    case AUTH_ACTIONS.EMAIL_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.EMAIL_FULFILLED:
      localStorage.setItem("csrfToken", action.payload.csrfToken)
      return {
        ...state,
        loading: false,
        authState: "AUTHENTICATED",
        user: action.payload.user,
        permissions: action.payload.permissions,
        plan: action.payload.plan,
        csrfToken: action.payload.csrfToken,
        tempEmail: null,
        tempPassword: null
      }
    case AUTH_ACTIONS.EMAIL_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload || "Email verification failed"
      }

    // Check Auth Status
    case AUTH_ACTIONS.VALIDATE_FULFILLED:
      if (action.payload.csrfToken) {
        localStorage.setItem("csrfToken", action.payload.csrfToken)
      }
      return {
        ...state,
        authState: "AUTHENTICATED",
        user: action.payload.user,
        csrfToken: action.payload.csrfToken
      }
    case AUTH_ACTIONS.VALIDATE_REJECTED:
      localStorage.removeItem("csrfToken")
      return {
        ...state,
        authState: "NOT_AUTH",
        user: null,
        permissions: null,
        plan: null,
        csrfToken: null
      }

    // Renew CSRF Token
    case AUTH_ACTIONS.CSRF_FULFILLED:
      localStorage.setItem("csrfToken", action.payload)
      return {
        ...state,
        csrfToken: action.payload
      }

    // Logout
    case AUTH_ACTIONS.LOGOUT_FULFILLED:
      localStorage.removeItem("csrfToken")
      return {
        ...state,
        authState: "NOT_AUTH",
        user: null,
        permissions: null,
        plan: null,
        csrfToken: null,
        tempEmail: null,
        tempPassword: null,
        error: null
      }

    // Resend MFA Code
    case AUTH_ACTIONS.RESEND_MFA_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.RESEND_MFA_FULFILLED:
      return {
        ...state,
        loading: false
      }
    case AUTH_ACTIONS.RESEND_MFA_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    // Resend Email Verification
    case AUTH_ACTIONS.RESEND_EMAIL_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.RESEND_EMAIL_FULFILLED:
      return {
        ...state,
        loading: false
      }
    case AUTH_ACTIONS.RESEND_EMAIL_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    // Forgot Password
    case AUTH_ACTIONS.FORGOT_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.FORGOT_FULFILLED:
      return {
        ...state,
        loading: false
      }
    case AUTH_ACTIONS.FORGOT_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    // Reset Password
    case AUTH_ACTIONS.RESET_PENDING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.RESET_FULFILLED:
      return {
        ...state,
        loading: false
      }
    case AUTH_ACTIONS.RESET_REJECTED:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    // Sync actions
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    case AUTH_ACTIONS.UPDATE_CSRF_TOKEN:
      localStorage.setItem("csrfToken", action.payload)
      return {
        ...state,
        csrfToken: action.payload
      }
    case AUTH_ACTIONS.CLEAR_TEMP_CREDENTIALS:
      return {
        ...state,
        tempEmail: null,
        tempPassword: null
      }

    default:
      return state
  }
}

export default authReducer