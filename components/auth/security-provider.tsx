"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { renewCsrfToken, logout } from "@/lib/store/auth-slice"

interface SecurityProviderProps {
  children: React.ReactNode
  validationInterval?: number // en minutes
}

export function SecurityProvider({ 
  children, 
  validationInterval = 30 // 30 minutes par défaut
}: SecurityProviderProps) {
  const dispatch = useAppDispatch()
  const { authState, csrfToken } = useAppSelector((state) => state.auth)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const isRefreshingRef = useRef(false)
  
  const MAX_RETRY_ATTEMPTS = 2
  const REFRESH_INTERVAL = validationInterval * 60 * 1000 // Convert to milliseconds

  const startRefreshTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    console.log(`🕒 Starting CSRF token refresh timer (every ${validationInterval} minutes)`)
    
    intervalRef.current = setInterval(async () => {
      // Éviter les appels multiples simultanés
      if (isRefreshingRef.current) {
        console.log("🔄 Refresh already in progress, skipping...")
        return
      }

      try {
        isRefreshingRef.current = true
        console.log("🔄 Auto-refreshing CSRF token...")
        await dispatch(renewCsrfToken()).unwrap()
        retryCountRef.current = 0
        console.log("✅ CSRF token refreshed successfully")
      } catch (error) {
        console.error("❌ CSRF token refresh failed:", error)
        retryCountRef.current += 1

        if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
          console.error("🚨 Max CSRF refresh retries reached, logging out user")
          dispatch(logout())
        }
      } finally {
        isRefreshingRef.current = false
      }
    }, REFRESH_INTERVAL)
  }

  const stopRefreshTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log("⏹️ CSRF token refresh timer stopped")
    }
    retryCountRef.current = 0
    isRefreshingRef.current = false
  }

  useEffect(() => {
    // Ajouter des listeners pour détecter les tentatives d'attaque
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState === "AUTHENTICATED") {
        console.log("🔍 Tab became visible")
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'csrfToken' && e.newValue === null && authState === "AUTHENTICATED") {
        console.log("🚨 CSRF token was removed from localStorage, potential attack detected")
        // Force logout si le token CSRF est supprimé
        window.location.href = '/login'
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [authState])

  useEffect(() => {
    // Démarrer le refresh timer seulement si authentifié ET après un délai initial
    if (authState === "AUTHENTICATED" && csrfToken) {
      // Délai de 10 minutes après l'authentification avant le premier refresh
      const startDelay = setTimeout(() => {
        startRefreshTimer()
      }, 10 * 60 * 1000) // 10 minutes de délai au lieu de 5

      return () => {
        clearTimeout(startDelay)
        stopRefreshTimer()
      }
    } else {
      stopRefreshTimer()
    }

    return () => stopRefreshTimer()
  }, [authState, csrfToken, validationInterval, dispatch])

  return <>{children}</>
}