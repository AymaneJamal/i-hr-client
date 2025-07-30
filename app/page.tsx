"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

export default function HomePage() {
  const router = useRouter()
  
  const authState = useAppSelector((state) => {
    try {
      return state?.auth?.authState || "NOT_AUTH"
    } catch (error) {
      console.error("Error accessing auth state:", error)
      return "NOT_AUTH"
    }
  })

  useEffect(() => {
    console.log("🏠 HomePage: Auth state is", authState)

    switch (authState) {
      case "AUTHENTICATED":
        console.log("🚀 Redirecting to dashboard")
        router.push("/dashboard/employees")
        break
      case "SEMI_AUTH":
        console.log("🔐 Redirecting to verify")
        router.push("/verify")
        break
      case "NOT_AUTH":
      default:
        console.log("🔑 Redirecting to login")
        router.push("/login")
    }
  }, [authState, router])

  // The loading is handled by AuthInitializer, so this should not be seen
  return null
}