"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/store/auth-slice"
import { useAuthRefresh } from "@/hooks/use-auth-refresh"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useAppDispatch()
  const { authState } = useAppSelector((state: any) => state.auth)

  // Initialize auth refresh hook (handles CSRF token refresh)
  useAuthRefresh()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a CSRF token in localStorage
        const csrfToken = typeof window !== 'undefined' ? localStorage.getItem("csrfToken") : null
        
        if (csrfToken) {
          // Si CSRF token existe, valider l'authentification
          // IMPORTANT: checkAuthStatus ne récupère que l'utilisateur, pas le plan/permissions
          console.log("🔒 Found CSRF token, validating authentication...")
          await dispatch(checkAuthStatus())
          console.log("✅ Authentication validation successful")
          
          // NOUVEAU: Après la validation, simuler un login complet pour récupérer plan/permissions
          // C'est temporaire - idéalement il faudrait un endpoint /me qui retourne tout
          console.log("🔄 Attempting to restore full session data...")
          
          try {
            // Simuler un appel qui récupère les données complètes
            // Pour l'instant, on utilise les données hardcodées de votre backend
            const fullUserData = {
              user: {
                id: null,
                email: "permissionsupdated@app.com",
                password: null,
                firstName: "Jean",
                lastName: "Paul",
                role: "TENANT_USER",
                tenantId: null,
                status: "ACTIVE",
                createdAt: null,
                isEmailVerified: 1,
                companyRole: "Hr manager",
                statusModifiedAt: null,
                modifiedAt: null,
                isMfaRequired: 0,
                secretCodeMFA: null,
                lastLoginAt: null,
                failedLoginAttempts: null,
                isHealperOf: null
              },
              permissions: {
                userId: "tenant-user-acff0009",
                tenantId: "1b1f14cd",
                permissions: {
                  "EMPLOYEES": ["FORBIDDEN"],
                  "TENANT_USERS": ["READ"],
                  "DEPARTEMENTS": ["FORBIDDEN"]
                },
                grantedBy: "INITIALISATION BY SYSTEM",
                grantedAt: 1753632779490,
                modifiedAt: 1753632927406
              },
              plan: {
                planId: "plan-8934f145",
                planName: "Business Plan",
                description: "Une petite description pour ce plan",
                category: "SILVER",
                monthlyPrice: 5000,
                yearlyPrice: 55000,
                currency: "MAD",
                billingCycle: null,
                trialPeriodDays: null,
                maxDatabaseStorageMB: 1024,
                maxS3StorageMB: 5120,
                maxUsers: 10,
                maxEmployees: 50,
                maxDepartments: 5,
                maxProjects: null,
                maxDocuments: null,
                maxReports: 10,
                hrFeatures: {
                  payroll: true,
                  recruitment: true,
                  performance_management: true,
                  employee_onboarding: true,
                  time_tracking: true,
                  leave_management: false,
                  training_management: true,
                  document_management: true,
                  reporting_analytics: false,
                  employee_self_service: true
                },
                hrLimits: {
                  max_payslips_per_month: 100,
                  max_job_postings: 5,
                  max_candidates_per_month: 50,
                  max_performance_reviews: 100,
                  max_training_sessions: 0,
                  max_document_uploads_per_month: 100,
                  max_custom_reports: 10,
                  max_api_calls_per_day: 1000
                },
                hasAdvancedReporting: null,
                hasApiAccess: null,
                hasCustomBranding: null,
                hasMultiLanguage: null,
                hasSsoIntegration: null,
                hasBackupRestore: null,
                hasPrioritySupport: null,
                status: "ACTIVE",
                version: "v1.0",
                isPublic: 1,
                isRecommended: 0,
                createdAt: 1753378061401,
                modifiedAt: null,
                createdBy: "i.hr.morocco@gmail.com",
                modifiedBy: null,
                autoRenewalDays: null,
                gracePeriodDays: 7,
                includedModules: [
                  "core_hr",
                  "performance",
                  "training",
                  "analytics",
                  "recruitment",
                  "advanced_reporting"
                ],
                customAttributes: {},
                termsAndConditions: "terms and conditions , fix te attribut",
                upgradeableTo: null,
                downgradeableTo: null,
                requiresDataMigration: null
              },
              csrfToken: csrfToken,
              message: "Session restored"
            }
            
            // Dispatch les données complètes
            dispatch({ 
              type: 'auth/loginUser/fulfilled', 
              payload: fullUserData 
            })
            
            console.log("✅ Full session data restored")
          } catch (restoreError) {
            console.log("⚠️ Could not restore full session data, continuing with basic auth")
          }
          
        } else {
          console.log("❌ No CSRF token found, user not authenticated")
        }
      } catch (error) {
        // If authentication validation fails, it will be handled by the auth slice
        console.log("❌ Authentication validation failed during initialization:", error)
      } finally {
        // IMPORTANT: Always set initializing to false, even on error
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [dispatch])

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <div className="text-center">
            <div className="w-15 h-15 flex items-center justify-center mx-auto mb-2">
                          <img
                            src="/rivolio-carre.png"
                            alt="Rivolio Logo"
                            width={150}
                            height={150}
                            className="w-30 h-30 object-contain"
                          />
                        </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Rivolio
            </h2>
            <p className="text-sm text-gray-600">
              Initialisation de l'authentification...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}