// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes and their requirements
const routeConfig = {
  // Public routes (no authentication required)
  public: [
    "/",
    "/login",
    "/forgot-password", 
    "/reset-password",
    "/verify"
  ],
  
  // Protected routes (authentication required)
  protected: [
    "/dashboard/employees",
  ],
  
  // Admin-only routes
  admin: [
    "/dashboard/settings",
    "/dashboard/system"
  ],
  
  // Routes that require specific permissions
  permissionBased: {
    "/dashboard/employees": ["EMPLOYEES"],
    "/dashboard/departments": ["DEPARTEMENTS"], 
    "/dashboard/users": ["TENANT_USERS"],
    "/dashboard/payroll": ["PAYROLL"],
    "/dashboard/reports": ["REPORTS"],
    "/dashboard/documents": ["DOCUMENTS"],
    "/dashboard/analytics": ["ANALYTICS"],
    "/dashboard/recruitment": ["RECRUITMENT"], 
    "/dashboard/performance": ["PERFORMANCE"],
    "/dashboard/training": ["TRAINING"],
    "/dashboard/leaves": ["EMPLOYEES"],
    "/dashboard/time-tracking": ["EMPLOYEES"]
  }
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return routeConfig.public.some(route => {
    if (route === "/") return pathname === "/"
    return pathname.startsWith(route)
  })
}

// Helper function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return routeConfig.protected.some(route => pathname.startsWith(route))
}

// Helper function to check if route requires admin access
function isAdminRoute(pathname: string): boolean {
  return routeConfig.admin.some(route => pathname.startsWith(route))
}

// Helper function to get required permissions for a route
function getRequiredPermissions(pathname: string): string[] {
  for (const [route, permissions] of Object.entries(routeConfig.permissionBased)) {
    if (pathname.startsWith(route)) {
      return permissions
    }
  }
  return []
}

// MODIFICATION: Vérifier uniquement le cookie CSRF (pas localStorage)
function hasAuthToken(request: NextRequest): boolean {
  const csrfToken = request.cookies.get("csrfToken")?.value
  return !!csrfToken
}

// Helper function to get user role from cookie or header (if available)
function getUserRole(request: NextRequest): string | null {
  const userRole = request.cookies.get("userRole")?.value
  return userRole || null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🛡️ Middleware: ${request.method} ${pathname}`)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log(`✅ Public route: ${pathname}`)
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const hasAuth = hasAuthToken(request)
    
    if (!hasAuth) {
      console.log(`🚫 No auth token for protected route: ${pathname}`)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      const userRole = getUserRole(request)
      
      if (userRole !== "TENANT_ADMIN") {
        console.log(`🚫 Non-admin user trying to access admin route: ${pathname}`)
        const dashboardUrl = new URL("/dashboard", request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }

    // Note: Permission-based route checking is handled client-side
    // since we need access to the full user permissions object
    // The middleware only does basic role-based checks
    
    console.log(`✅ Authenticated access to: ${pathname}`)
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Add CSRF token header if available
  const csrfToken = request.cookies.get("csrfToken")?.value
  if (csrfToken) {
    response.headers.set("X-CSRF-Token", csrfToken)
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
}