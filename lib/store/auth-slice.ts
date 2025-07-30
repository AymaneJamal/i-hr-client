// lib/store/auth-slice.ts

import { AuthEndpoints } from "@/lib/api/auth-endpoints"
import type {
  AuthSliceState,
  LoginRequest,
  ValidateTokenRequest,
  UserRole
} from "@/lib/types/auth"
function saveCompleteAuthData(data: { user: any, permissions: any, plan: any, csrfToken: string }) {
  if (typeof window !== 'undefined') {
    // Sauvegarder chaque donnée séparément
    localStorage.setItem("csrfToken", data.csrfToken)
    localStorage.setItem("userData", JSON.stringify(data.user))
    localStorage.setItem("userPermissions", JSON.stringify(data.permissions))
    localStorage.setItem("userPlan", JSON.stringify(data.plan))
    
    // Cookie pour middleware
    if (typeof document !== 'undefined') {
      document.cookie = `csrfToken=${data.csrfToken}; path=/; secure; samesite=strict; max-age=86400`
    }
  }
}


function loadCompleteAuthData() {
  if (typeof window !== 'undefined') {
    try {
      const csrfToken = localStorage.getItem("csrfToken")
      const userData = localStorage.getItem("userData")
      const userPermissions = localStorage.getItem("userPermissions")
      const userPlan = localStorage.getItem("userPlan")
      
      if (csrfToken && userData) {
        return {
          csrfToken,
          user: JSON.parse(userData),
          permissions: userPermissions ? JSON.parse(userPermissions) : null,
          plan: userPlan ? JSON.parse(userPlan) : null
        }
      }
    } catch (error) {
      console.error("Error loading auth data:", error)
    }
  }
  return null
}


function clearCompleteAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("csrfToken")
    localStorage.removeItem("userData")
    localStorage.removeItem("userPermissions")
    localStorage.removeItem("userPlan")
    
    if (typeof document !== 'undefined') {
      document.cookie = "csrfToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }
}









// Helper functions pour gérer les cookies et localStorage - FIXED
function saveCsrfToken(token: string) {
  // LocalStorage (toujours disponible côté client)
  if (typeof window !== 'undefined') {
    localStorage.setItem("csrfToken", token)
    
    // Cookie (pour le middleware) - SEULEMENT côté client
    if (typeof document !== 'undefined') {
      document.cookie = `csrfToken=${token}; path=/; secure; samesite=strict; max-age=86400`
    }
  }
}

function removeCsrfToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("csrfToken")
    
    // Supprimer aussi le cookie - SEULEMENT côté client
    if (typeof document !== 'undefined') {
      document.cookie = "csrfToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }
}

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
    
    // DEBUG: Log ce qui arrive du backend
    console.log("🔍 Login response received:", response)
    
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
    // Essayer de charger depuis localStorage d'abord
    const savedData = loadCompleteAuthData()
    
    if (!savedData) {
      throw new Error("No saved auth data found")
    }
    
    // Valider le token
    const roles = ["TENANT_ADMIN", "TENANT_USER", "TENANT_HELPER"]
    
    for (const role of roles) {
      try {
        const response = await dispatch(validateToken({ role }))
        
        // Restaurer TOUTES les données sauvegardées
        const result = { 
          user: savedData.user,
          permissions: savedData.permissions,
          plan: savedData.plan,
          csrfToken: response.newCsrfToken || savedData.csrfToken
        }
        
        // Mettre à jour le CSRF token si nouveau
        if (response.newCsrfToken) {
          saveCompleteAuthData({
            ...savedData,
            csrfToken: response.newCsrfToken
          })
        }
        
        dispatch({ type: AUTH_ACTIONS.VALIDATE_FULFILLED, payload: result })
        return result
      } catch (roleError) {
        continue
      }
    }
    
    throw new Error("No valid role found")
  } catch (error: any) {
    clearCompleteAuthData()
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
      // DEBUG: Log ce qui arrive dans le reducer
      console.log("🔍 LOGIN_FULFILLED payload:", action.payload)
      
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
        // SUCCESS - Login complet
        if (action.payload.csrfToken) {
          saveCompleteAuthData({
            user: action.payload.user,
            permissions: action.payload.permissions,
            plan: action.payload.plan,
            csrfToken: action.payload.csrfToken
          })
        }
        
        // DEBUG: Log ce qui va être sauvegardé
        console.log("🔍 Saving to Redux - Plan:", action.payload.plan)
        console.log("🔍 Saving to Redux - Permissions:", action.payload.permissions)
        
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
      saveCsrfToken(action.payload.csrfToken)
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
      saveCsrfToken(action.payload.csrfToken)
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
        // Sauvegarder toutes les données si elles existent
        if (action.payload.csrfToken) {
          saveCompleteAuthData({
            user: action.payload.user,
            permissions: action.payload.permissions,
            plan: action.payload.plan,
            csrfToken: action.payload.csrfToken
          })
        }
        return {
          ...state,
          authState: "AUTHENTICATED",
          user: action.payload.user,
          permissions: action.payload.permissions,  // AJOUTÉ
          plan: action.payload.plan,               // AJOUTÉ
          csrfToken: action.payload.csrfToken
        }
    case AUTH_ACTIONS.VALIDATE_REJECTED:
      removeCsrfToken()
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
      saveCsrfToken(action.payload)
      return {
        ...state,
        csrfToken: action.payload
      }

    // Logout
    case AUTH_ACTIONS.LOGOUT_FULFILLED:
      clearCompleteAuthData()
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
      saveCsrfToken(action.payload)
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