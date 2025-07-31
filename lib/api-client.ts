// lib/api-client.ts

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4010"

// Headers constants
const API_HEADERS = {
  CSRF_TOKEN: "X-CSRF-Token",
  USER_EMAIL: "X-User-Email",
  CONTENT_TYPE: "Content-Type"
} as const

// Request config interface for our custom options
interface CustomRequestConfig {
  skipAuth?: boolean
  includeUserEmail?: boolean
  customHeaders?: Record<string, string>
}

// Extended request config
interface ExtendedRequestConfig extends CustomRequestConfig {
  timeout?: number
  headers?: Record<string, string>
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      [API_HEADERS.CONTENT_TYPE]: "application/json"
    }
  }

  private async fetchWithAuth(
    url: string, 
    options: RequestInit & CustomRequestConfig = {}
  ): Promise<Response> {
    const { skipAuth, includeUserEmail, customHeaders, ...fetchOptions } = options

    // Build full URL
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`

    // Build headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders
    }

    // Add CSRF token if not skipping auth
    if (!skipAuth) {
      const csrfToken = localStorage.getItem("csrfToken")
      if (csrfToken) {
        headers[API_HEADERS.CSRF_TOKEN] = csrfToken
      }
    }

    // Add user email if requested
    if (includeUserEmail) {
      const userEmail = this.getCurrentUserEmail()
      if (userEmail) {
        headers[API_HEADERS.USER_EMAIL] = userEmail
      }
    }

    console.log("🔍 API Request:", {
      url: fullUrl,
      method: fetchOptions.method || "GET",
      headers,
      includeUserEmail
    })

    // Make request
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      credentials: "include", // Important for JWT cookies
    })

    console.log("📡 API Response:", {
      url: fullUrl,
      status: response.status,
      ok: response.ok
    })

    // Handle authentication errors
    if (response.status === 401) {
      this.handleAuthError()
    }

    return response
  }

  private getCurrentUserEmail(): string | null {
    try {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        return user.email || null
      }
      return null
    } catch {
      return null
    }
  }

  private handleAuthError(): void {
    console.log("🚨 Authentication error detected, clearing local storage")
    localStorage.removeItem("csrfToken")
    localStorage.removeItem("userData")
    localStorage.removeItem("userPermissions")
    localStorage.removeItem("userPlan")
    
    // Redirect to login if not already there
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login"
    }
  }

  // HTTP Methods
  async get(url: string, config?: ExtendedRequestConfig): Promise<any> {
    const response = await this.fetchWithAuth(url, {
      method: "GET",
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post(url: string, data?: any, config?: ExtendedRequestConfig): Promise<any> {
    const response = await this.fetchWithAuth(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const jsonResponse = await response.json()
    
    // Debug temporaire - à supprimer après
    if (url.includes('/login')) {
      console.log("🔍 API Response JSON:", jsonResponse)
    }

    return jsonResponse
  }

  async put(url: string, data?: any, config?: ExtendedRequestConfig): Promise<any> {
    const response = await this.fetchWithAuth(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async patch(url: string, data?: any, config?: ExtendedRequestConfig): Promise<any> {
    const response = await this.fetchWithAuth(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete(url: string, config?: ExtendedRequestConfig): Promise<any> {
    const response = await this.fetchWithAuth(url, {
      method: "DELETE",
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // File upload method
  async uploadFile(url: string, formData: FormData, config?: ExtendedRequestConfig): Promise<any> {
    const { customHeaders, ...restConfig } = config || {}
    
    // Don't set Content-Type for file uploads - let browser set it
    const headers = customHeaders || {}
    delete headers['Content-Type']

    const response = await this.fetchWithAuth(url, {
      method: "POST",
      body: formData,
      customHeaders: headers,
      ...restConfig,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Download file method
  async downloadFile(url: string, config?: ExtendedRequestConfig): Promise<Blob> {
    const response = await this.fetchWithAuth(url, {
      method: "GET",
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()