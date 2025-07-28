"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { VerificationForm } from "@/components/auth/verification-form"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { EmployeesDashboard } from "@/components/dashboard/employees/employees-dashboard"
import { LeavesDashboard } from "@/components/dashboard/leaves/leaves-dashboard"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

function DashboardContent() {
  const [currentView, setCurrentView] = useState<"employees" | "leaves">("employees")

  if (currentView === "employees") {
    return <EmployeesDashboard />
  }

  if (currentView === "leaves") {
    return <LeavesDashboard />
  }

  return <EmployeesDashboard />
}

export default function HomePage() {
  const { authState } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showResetSuccess, setShowResetSuccess] = useState(false)

  if (authState === "NOT_AUTH") {
    if (showResetSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mot de passe réinitialisé !</h1>
            <p className="text-gray-600">Votre mot de passe a été mis à jour avec succès.</p>
            <Button
              onClick={() => {
                setShowResetSuccess(false)
                setShowResetPassword(false)
                setShowForgotPassword(false)
              }}
              className="bg-[#2d5a5a] hover:bg-[#2d5a5a]/90"
            >
              Se connecter
            </Button>
          </div>
        </div>
      )
    }

    if (showResetPassword) {
      return (
        <ResetPasswordForm
          email={resetEmail}
          onBackToLogin={() => {
            setShowResetPassword(false)
            setShowForgotPassword(false)
          }}
          onSuccess={() => setShowResetSuccess(true)}
        />
      )
    }

    if (showForgotPassword) {
      return (
        <ForgotPasswordForm
          onBackToLogin={() => setShowForgotPassword(false)}
          onResetPassword={(email) => {
            setResetEmail(email)
            setShowResetPassword(true)
          }}
        />
      )
    }

    return <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
  }

  if (authState === "SEMI_AUTH") {
    return <VerificationForm />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 bg-muted/30">
            <DashboardContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
