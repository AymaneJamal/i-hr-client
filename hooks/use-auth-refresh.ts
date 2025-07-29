// hooks/use-auth-refresh.ts

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { renewCsrfToken, logout } from "@/lib/store/auth-slice"

const REFRESH_INTERVAL = 5000 // 5 seconds
const MAX_RETRY_ATTEMPTS = 3

export function useAuthRefresh() {
  const dispatch = useAppDispatch()
  const { authState, csrfToken } = useAppSelector((state: any) => state.auth)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  const startRefreshTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing CSRF token...")
        await dispatch(renewCsrfToken())
        retryCountRef.current = 0 // Reset retry count on success
        console.log("✅ CSRF token refreshed successfully")
      } catch (error) {
        console.error("❌ CSRF token refresh failed:", error)
        retryCountRef.current += 1

        // If max retries reached, logout user for security
        if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
          console.error("🚨 Max CSRF refresh retries reached, logging out user")
          dispatch(logout())
        }
      }
    }, REFRESH_INTERVAL)
  }

  const stopRefreshTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    retryCountRef.current = 0
  }

  useEffect(() => {
    // Only start refresh timer when user is authenticated and has CSRF token
    if (authState === "AUTHENTICATED" && csrfToken) {
      console.log("🕒 Starting CSRF token refresh timer")
      startRefreshTimer()
    } else {
      console.log("⏹️ Stopping CSRF token refresh timer")
      stopRefreshTimer()
    }

    // Cleanup on unmount
    return () => {
      stopRefreshTimer()
    }
  }, [authState, csrfToken, dispatch])

  return {
    refreshToken: () => dispatch(renewCsrfToken()),
    isRefreshing: intervalRef.current !== null
  }
}