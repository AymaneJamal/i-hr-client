import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api-client"

export type AuthState = "NOT_AUTH" | "SEMI_AUTH" | "AUTHENTICATED"

interface User {
  id: string | null
  email: string
  password: string | null
  firstName: string
  lastName: string
  role: string
  tenantId: string | null
  status: string
  createdAt: string | null
  isEmailVerified: number
  companyRole: string | null
  statusModifiedAt: string | null
  modifiedAt: string | null
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number | null
}

interface AuthSliceState {
  authState: AuthState
  user: User | null
  permissions: any | null
  plan: any | null
  csrfToken: string | null
  loading: boolean
  error: string | null
  tempEmail: string | null
  tempPassword: string | null
}

// Fonctions utilitaires pour gérer le stockage sécurisé
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

function saveCsrfToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem("csrfToken", token)
    
    if (typeof document !== 'undefined') {
      document.cookie = `csrfToken=${token}; path=/; secure; samesite=strict; max-age=86400`
    }
  }
}

function removeCsrfToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("csrfToken")
    
    if (typeof document !== 'undefined') {
      document.cookie = "csrfToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }
}

const initialState: AuthSliceState = {
  authState: "NOT_AUTH",
  user: null,
  permissions: null,
  plan: null,
  csrfToken: null,
  loading: false,
  error: null,
  tempEmail: null,
  tempPassword: null,
}

// Helper function to get new CSRF token
export const renewCsrfToken = createAsyncThunk(
  "auth/renewCsrfToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/client/public/auth/csrf-token", { skipAuth: true })
      console.log("🔄 CSRF renewal response:", response)
      return response.csrfToken || response.data?.csrfToken
    } catch (error: any) {
      console.error("❌ CSRF renewal failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to get CSRF token")
    }
  }
)

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/client/public/auth/login", { email, password })
      
      console.log("🔍 Login Response Structure:", response)
      
      // Vérifier la structure selon votre AuthResponse type
      if (response.success && response.responseType === "SUCCESS") {
        const userData = response.data?.user
        const csrfToken = response.data?.additionalData?.csrfToken
        const permissions = response.data?.additionalData?.permissions
        const plan = response.data?.additionalData?.plan
        
        console.log("✅ Extracted data:", {
          user: userData?.email,
          permissions: typeof permissions === "string" ? permissions : "object",
          plan: plan?.planName,
          csrfToken: csrfToken ? "present" : "missing"
        })
        
        return {
          requiresMFA: false,
          user: userData,
          permissions: permissions,
          plan: plan,
          csrfToken: csrfToken,
          message: response.message
        }
      }
      
      // Gérer les cas d'erreur ou de réponse inattendue
      console.log("❌ Unexpected response structure:", response)
      return rejectWithValue(response.message || "Structure de réponse inattendue")
      
    } catch (error: any) {
      console.log("🔍 Login Error Details:", error)
      
      if (error.response?.status === 401 && 
          error.response?.data?.responseType === "MFA_REQUIRED") {
        return {
          requiresMFA: true,
          email,
          password,
          message: error.response.data.message
        }
      }
      
      return rejectWithValue(error.response?.data?.message || error.message || "Login failed")
    }
  },
)

// Verify MFA
export const verifyMFA = createAsyncThunk(
  "auth/verifyMFA", 
  async ({ code }: { code: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthSliceState }
      const { tempEmail, tempPassword } = state.auth
      
      if (!tempEmail || !tempPassword) {
        return rejectWithValue("Email and password not found. Please login again.")
      }
      
      const response = await apiClient.post("/api/auth/public/login/mfa", {
        email: tempEmail,
        password: tempPassword,
        mfaCode: code
      })
      
      if (response.data.success && response.data.responseType === "SUCCESS") {
        const csrfToken = response.data.data?.additionalData?.csrfToken
        
        return {
          user: response.data.data.user,
          permissions: response.data.data.permissions,
          plan: response.data.data.plan,
          csrfToken: csrfToken,
          message: response.data.message
        }
      }
      
      return rejectWithValue(response.data.message || "MFA verification failed")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "MFA verification failed")
    }
  }
)

// Protection contre les appels multiples
let isValidating = false

// Validate token with proper CSRF handling
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async ({ role }: { role: string }, { dispatch, rejectWithValue }) => {
    // Éviter les appels multiples simultanés
    if (isValidating) {
      console.log("🔄 Token validation already in progress, skipping...")
      return rejectWithValue("Validation already in progress")
    }

    try {
      isValidating = true
      console.log("🔍 Starting token validation...")
      
      const response = await apiClient.post("/client/validate/token", { role })
      
      if (response.valid && response.status === "AUTHORIZED") {
        console.log("✅ Token validation successful")
        return {
          role: response.data.role,
          email: response.data.email,
          message: response.message
        }
      }
      
      return rejectWithValue(response.message || "Token validation failed")
    } catch (error: any) {
      if (error.response?.status === 401 && 
          error.response?.data?.message === "CSRF validation failed") {
        
        console.log("🔄 CSRF validation failed, attempting to renew CSRF token...")
        
        try {
          const newCsrfToken = await dispatch(renewCsrfToken()).unwrap()
          localStorage.setItem("csrfToken", newCsrfToken)
          
          const retryResponse = await apiClient.post("/client/validate/token", { role })
          
          if (retryResponse.valid && retryResponse.status === "AUTHORIZED") {
            console.log("✅ Token validation successful after CSRF renewal")
            return {
              role: retryResponse.data.role,
              email: retryResponse.data.email,
              message: retryResponse.message,
              newCsrfToken
            }
          }
          
          return rejectWithValue(retryResponse.message || "Token validation failed after CSRF renewal")
        } catch (csrfError: any) {
          console.log("🚨 CSRF renewal failed, JWT is invalid - logging out")
          return rejectWithValue("JWT_INVALID")
        }
      }
      
      return rejectWithValue("JWT_INVALID")
    } finally {
      isValidating = false
    }
  }
)

// Check authentication status on app initialization - VERSION SIMPLIFIÉE
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus", 
  async (_, { rejectWithValue }) => {
    try {
      // Essayer de charger depuis localStorage seulement
      const savedData = loadCompleteAuthData()
      
      if (!savedData) {
        return rejectWithValue("No saved auth data found")
      }
      
      console.log("✅ Auth status restored from localStorage")
      return savedData
      
    } catch (error: any) {
      console.log("❌ Auth status check failed:", error)
      clearCompleteAuthData()
      return rejectWithValue(error.message || "Authentication check failed")
    }
  }
)

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/forgot-password", { email })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send reset email")
    }
  }
)

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/api/auth/logout")
      clearCompleteAuthData()
      return { message: "Logged out successfully" }
    } catch (error: any) {
      // Even if logout request fails, clear local data
      clearCompleteAuthData()
      return { message: "Logged out locally" }
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateCsrfToken: (state, action) => {
      state.csrfToken = action.payload
      saveCsrfToken(action.payload)
    },
    clearTempCredentials: (state) => {
      state.tempEmail = null
      state.tempPassword = null
    },
    restoreSession: (state, action) => {
      const { user, permissions, plan, csrfToken } = action.payload
      state.authState = "AUTHENTICATED"
      state.user = user
      state.permissions = permissions
      state.plan = plan
      state.csrfToken = csrfToken
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        
        if (action.payload.requiresMFA) {
          state.authState = "SEMI_AUTH"
          state.tempEmail = action.payload.email || null
          state.tempPassword = action.payload.password || null
        } else {
          // Login complet - sauvegarder toutes les données
          state.authState = "AUTHENTICATED"
          state.user = action.payload.user || null
          state.permissions = action.payload.permissions || null
          state.plan = action.payload.plan || null
          state.csrfToken = action.payload.csrfToken || null
          
          if (action.payload.csrfToken) {
            saveCompleteAuthData({
              user: action.payload.user,
              permissions: action.payload.permissions,
              plan: action.payload.plan,
              csrfToken: action.payload.csrfToken
            })
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Login failed"
      })

      // MFA Verification
      .addCase(verifyMFA.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.loading = false
        state.authState = "AUTHENTICATED"
        state.user = action.payload.user || null
        state.permissions = action.payload.permissions || null
        state.plan = action.payload.plan || null
        state.csrfToken = action.payload.csrfToken || null
        state.tempEmail = null
        state.tempPassword = null
        
        if (action.payload.csrfToken) {
          saveCompleteAuthData({
            user: action.payload.user,
            permissions: action.payload.permissions,
            plan: action.payload.plan,
            csrfToken: action.payload.csrfToken
          })
        }
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "MFA verification failed"
      })

      // Token Validation
      .addCase(validateToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.newCsrfToken) {
          state.csrfToken = action.payload.newCsrfToken
          saveCsrfToken(action.payload.newCsrfToken)
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Token validation failed"
        
        if (action.payload === "JWT_INVALID") {
          console.log("JWT is invalid, logging out user")
          state.authState = "NOT_AUTH"
          state.user = null
          state.permissions = null
          state.plan = null
          state.csrfToken = null
          clearCompleteAuthData()
        }
      })

      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false
        state.authState = "AUTHENTICATED"
        state.user = action.payload.user
        state.permissions = action.payload.permissions
        state.plan = action.payload.plan
        state.csrfToken = action.payload.csrfToken
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false
        state.authState = "NOT_AUTH"
        state.user = null
        state.permissions = null
        state.plan = null
        state.csrfToken = null
        state.error = action.payload as string || "Authentication check failed"
        clearCompleteAuthData()
      })

      // Renew CSRF Token
      .addCase(renewCsrfToken.fulfilled, (state, action) => {
        state.csrfToken = action.payload
        saveCsrfToken(action.payload)
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.authState = "NOT_AUTH"
        state.user = null
        state.permissions = null
        state.plan = null
        state.csrfToken = null
        state.tempEmail = null
        state.tempPassword = null
        state.error = null
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to send reset email"
      })
  },
})

export const { clearError, updateCsrfToken, clearTempCredentials, restoreSession } = authSlice.actions
export default authSlice.reducer