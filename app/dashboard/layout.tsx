"use client"

import type React from "react"
import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { RouteProtector } from "@/components/auth/route-protector"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { PlanBadge, PlanStatusBadge } from "@/components/ui/plan-badge"
import { RoleIndicator, AdminIndicator } from "@/components/ui/role-indicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, RefreshCw, Info } from "lucide-react"


// Loading component for dashboard
function DashboardLoading() {
 return (
   <div className="flex items-center justify-center min-h-screen bg-gray-50">
     <div className="flex flex-col items-center space-y-4">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
       <div className="text-center">
         <h2 className="text-lg font-semibold text-gray-900 mb-1">
           i-RH Client
         </h2>
         <p className="text-sm text-gray-600">
           Chargement du dashboard...
         </p>
       </div>
     </div>
   </div>
 )
}

// User welcome card component
function UserWelcomeCard() {
 const { user } = usePermissions()
 const { plan } = usePlanFeatures()

 if (!user) return null

 const displayName = user.firstName && user.lastName 
   ? `${user.firstName} ${user.lastName}`
   : user.email

 return (
   <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
     <CardContent className="p-6">
       <div className="flex items-center justify-between">
         <div className="space-y-2">
           <div className="flex items-center space-x-3">
             <div>
               <h2 className="text-xl font-semibold text-gray-900">
                 Bienvenue, {displayName}
               </h2>
               <div className="flex items-center space-x-2 mt-1">
                 <RoleIndicator size="sm" />
                 {user.role === "TENANT_ADMIN" && <AdminIndicator />}
               </div>
             </div>
           </div>
           
           {user.companyRole && (
             <p className="text-sm text-gray-600">
               {user.companyRole}
             </p>
           )}
         </div>
         
         <div className="text-right space-y-2">
           {plan && (
             <div className="space-y-1">
               <PlanBadge size="sm" />
               <PlanStatusBadge />
             </div>
           )}
         </div>
       </div>
     </CardContent>
   </Card>
 )
}

// Status alerts component
function StatusAlerts() {
 const { user, permissions } = usePermissions()
 const { isPlanActive, plan } = usePlanFeatures()
 
 const alerts = []

 // Plan inactive alert
 if (!isPlanActive) {
   alerts.push({
     type: "error" as const,
     icon: AlertTriangle,
     title: "Plan inactif",
     message: "Votre plan n'est pas actif. Certaines fonctionnalités peuvent être limitées. Contactez votre administrateur.",
     action: null
   })
 }

 // Missing permissions alert for non-admin users
 if (user && user.role !== "TENANT_ADMIN" && !permissions) {
   alerts.push({
     type: "info" as const,
     icon: Clock,
     title: "Chargement des permissions",
     message: "Chargement de vos permissions en cours...",
     action: null
   })
 }

 // Plan expiration warning (if applicable)
 if (plan && plan.gracePeriodDays && plan.gracePeriodDays > 0) {
   alerts.push({
     type: "warning" as const,
     icon: Info,
     title: "Plan en période de grâce",
     message: `Votre plan expire bientôt. ${plan.gracePeriodDays} jours restants.`,
     action: user?.role === "TENANT_ADMIN" ? (
       <Button size="sm" variant="outline">
         Renouveler
       </Button>
     ) : null
   })
 }

 if (alerts.length === 0) return null

 return (
   <div className="space-y-3">
     {alerts.map((alert, index) => (
       <Alert 
         key={index}
         variant={alert.type === "error" ? "destructive" : "default"}
         className={
           alert.type === "warning" ? "border-yellow-200 bg-yellow-50" :
           alert.type === "info" ? "border-blue-200 bg-blue-50" : ""
         }
       >
         <alert.icon className="h-4 w-4" />
         <div className="flex items-center justify-between flex-1">
           <div>
             <div className="font-medium">{alert.title}</div>
             <AlertDescription className="mt-1">
               {alert.message}
             </AlertDescription>
           </div>
           {alert.action && (
             <div className="ml-4">
               {alert.action}
             </div>
           )}
         </div>
       </Alert>
     ))}
   </div>
 )
}

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const router = useRouter()
 const { authState, user, csrfToken } = useAppSelector((state: any) => state.auth)

 useEffect(() => {
   // Simple check without additional validation to avoid loops
   if (authState === "NOT_AUTH") {
     console.log("🚪 Dashboard: User not authenticated, redirecting to login")
     router.push("/login")
     return
   }

   if (authState === "SEMI_AUTH") {
     console.log("🔐 Dashboard: User needs MFA verification, redirecting")
     router.push("/verify")
     return
   }

   if (authState === "AUTHENTICATED" && (!csrfToken || !user)) {
     console.log("🚨 Dashboard: Authenticated but missing CSRF or user data, redirecting to login")
     router.push("/login")
     return
   }

   console.log("✅ Dashboard: User authenticated and verified")
 }, [authState, csrfToken, user, router])

 // Show loading while auth state is being determined or if redirecting
 if (authState !== "AUTHENTICATED" || !csrfToken || !user) {
   return <DashboardLoading />
 }

 return (
   <RouteProtector showFallback={true}>
     <div className="min-h-screen bg-gray-50">
       <Navbar />
       
       <div className="pt-20 flex">
         <Sidebar />
         
         {/* Main content area */}
         <main className="flex-1 ml-64 p-6">
           <div className="max-w-7xl mx-auto space-y-6">
             
             {/* Status alerts */}
             <StatusAlerts />
             
             {/* User welcome card */}
             <UserWelcomeCard />
             
             {/* Page content wrapper */}
             <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
               <Suspense 
                 fallback={
                   <div className="flex items-center justify-center p-8">
                     <div className="flex items-center space-x-3">
                       <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                       <span className="text-gray-600">Chargement...</span>
                     </div>
                   </div>
                 }
               >
                 {children}
               </Suspense>
             </div>
             
             {/* Footer info */}
             <div className="text-center py-4">
               <p className="text-xs text-gray-500">
                 i-RH Client - Gestion des ressources humaines
               </p>
             </div>
           </div>
         </main>
       </div>
     </div>
   </RouteProtector>
 )
}