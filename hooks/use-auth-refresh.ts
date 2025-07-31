// hooks/use-auth-refresh.ts

import { useAppDispatch } from "@/lib/hooks"
import { renewCsrfToken } from "@/lib/store/auth-slice"

export function useAuthRefresh() {
  const dispatch = useAppDispatch()

  const refreshToken = async () => {
    try {
      console.log("🔄 Manual CSRF token refresh...")
      const result = await dispatch(renewCsrfToken()).unwrap()
      console.log("✅ Manual CSRF token refresh successful")
      return result
    } catch (error) {
      console.error("❌ Manual CSRF token refresh failed:", error)
      throw error
    }
  }

  return {
    refreshToken,
    isRefreshing: false
  }
}