"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import {
 LayoutDashboard,
 Users,
 Building2,
 Settings,
 FileText,
 BarChart3,
 UserCheck,
 CreditCard,
 Calendar,
 Clock,
 TrendingUp,
 BookOpen,
 Shield,
 Database
} from "lucide-react"

// Define navigation item type
interface NavItem {
 title: string
 href: string
 icon: typeof LayoutDashboard
 permission?: string
 planFeature?: string
 planModule?: string
 requiredRole?: string[]
}

// Define all navigation items
const allNavItems: NavItem[] = [
 {
   title: "Tableau de bord",
   href: "/dashboard",
   icon: LayoutDashboard
 },
 {
   title: "Employés",
   href: "/dashboard/employees",
   icon: Users,
   permission: "EMPLOYEES",
   planModule: "core_hr"
 },
 {
   title: "Départements",
   href: "/dashboard/departments",
   icon: Building2,
   permission: "DEPARTEMENTS",
   planModule: "core_hr"
 },
 {
   title: "Utilisateurs",
   href: "/dashboard/users",
   icon: UserCheck,
   permission: "TENANT_USERS",
   planModule: "core_hr"
 },
 {
   title: "Paie",
   href: "/dashboard/payroll",
   icon: CreditCard,
   permission: "PAYROLL",
   planFeature: "payroll"
 },
 {
   title: "Congés",
   href: "/dashboard/leaves",
   icon: Calendar,
   permission: "EMPLOYEES",
   planFeature: "leave_management"
 },
 {
   title: "Temps de travail",
   href: "/dashboard/time-tracking",
   icon: Clock,
   permission: "EMPLOYEES",
   planFeature: "time_tracking"
 },
 {
   title: "Recrutement",
   href: "/dashboard/recruitment",
   icon: Users,
   permission: "RECRUITMENT",
   planFeature: "recruitment",
   planModule: "recruitment"
 },
 {
   title: "Performance",
   href: "/dashboard/performance",
   icon: TrendingUp,
   permission: "PERFORMANCE",
   planFeature: "performance_management",
   planModule: "performance"
 },
 {
   title: "Formation",
   href: "/dashboard/training",
   icon: BookOpen,
   permission: "TRAINING",
   planFeature: "training_management",
   planModule: "training"
 },
 {
   title: "Documents",
   href: "/dashboard/documents",
   icon: FileText,
   permission: "DOCUMENTS",
   planFeature: "document_management"
 },
 {
   title: "Rapports",
   href: "/dashboard/reports",
   icon: BarChart3,
   permission: "REPORTS",
   planFeature: "reporting_analytics",
   planModule: "analytics"
 },
 {
   title: "Analyses",
   href: "/dashboard/analytics",
   icon: Database,
   permission: "ANALYTICS",
   planFeature: "reporting_analytics",
   planModule: "advanced_reporting"
 },
 {
   title: "Paramètres",
   href: "/dashboard/settings",
   icon: Settings,
   requiredRole: ["TENANT_ADMIN"]
 }
]

export function ConditionalSidebar() {
 const pathname = usePathname()
 
 const { user, hasAnyPermission } = usePermissions()
 const { plan, hasFeature, hasModule, getPlanInfo } = usePlanFeatures()

 // Filter navigation items based on user permissions and plan
 const getVisibleNavItems = (): NavItem[] => {
   if (!user) return []

   return allNavItems.filter((item: NavItem) => {
     // Check role requirement
     if (item.requiredRole && !item.requiredRole.includes(user.role)) {
       return false
     }

     // For TENANT_ADMIN, check only plan constraints
     if (user.role === "TENANT_ADMIN") {
       // Check if plan feature is required and enabled
       if (item.planFeature && !hasFeature(item.planFeature as any)) {
         return false
       }
       
       // Check if plan module is required and included
       if (item.planModule && !hasModule(item.planModule)) {
         return false
       }
       
       return true
     }

     // For TENANT_USER and TENANT_HELPER, check both permissions and plan
     if (item.permission) {
       // Check if has any access
       if (!hasAnyPermission(item.permission as any)) {
         return false
       }
     }

     // Check plan constraints
     if (item.planFeature && !hasFeature(item.planFeature as any)) {
       return false
     }
     
     if (item.planModule && !hasModule(item.planModule)) {
       return false
     }

     return true
   })
 }

 const visibleNavItems = getVisibleNavItems()
 
 // Group items by category
 const mainItems = visibleNavItems.filter((item: NavItem) => 
   ["/dashboard", "/dashboard/employees", "/dashboard/departments", "/dashboard/users"].includes(item.href)
 )
 
 const hrItems = visibleNavItems.filter((item: NavItem) =>
   ["/dashboard/payroll", "/dashboard/leaves", "/dashboard/time-tracking"].includes(item.href)
 )
 
 const managementItems = visibleNavItems.filter((item: NavItem) =>
   ["/dashboard/recruitment", "/dashboard/performance", "/dashboard/training"].includes(item.href)
 )
 
 const dataItems = visibleNavItems.filter((item: NavItem) =>
   ["/dashboard/documents", "/dashboard/reports", "/dashboard/analytics"].includes(item.href)
 )
 
 const settingsItems = visibleNavItems.filter((item: NavItem) =>
   item.href === "/dashboard/settings"
 )

 const planInfo = getPlanInfo

 if (!user) {
   return null
 }

 return (
   <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
     <div className="p-4 space-y-2">
       
       {/* Plan Info */}
       {planInfo && (
         <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
           <div className="flex items-center justify-between mb-2">
             <h4 className="text-sm font-medium text-teal-800">Plan Actuel</h4>
             <Badge variant="secondary" className="text-xs">
               {planInfo.category}
             </Badge>
           </div>
           <p className="text-xs text-teal-700">{planInfo.name}</p>
           <div className="mt-2 text-xs text-teal-600">
             {planInfo.maxEmployees} employés max
           </div>
         </div>
       )}

       {/* User Role Badge */}
       <div className="mb-4 p-2 bg-gray-50 rounded-lg">
         <div className="flex items-center space-x-2">
           <Shield className="h-4 w-4 text-gray-500" />
           <span className="text-sm font-medium text-gray-700">
             {user.role === "TENANT_ADMIN" ? "Administrateur" : 
              user.role === "TENANT_USER" ? "Utilisateur" : "Assistant"}
           </span>
         </div>
       </div>

       {/* Main Navigation */}
       {mainItems.length > 0 && (
         <div className="space-y-1">
           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
             Principal
           </h3>
           {mainItems.map((item: NavItem) => (
             <Link key={item.href} href={item.href}>
               <Button
                 variant={pathname === item.href ? "secondary" : "ghost"}
                 size="sm"
                 className={cn(
                   "w-full justify-start",
                   pathname === item.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                 )}
               >
                 <item.icon className="mr-2 h-4 w-4" />
                 {item.title}
               </Button>
             </Link>
           ))}
         </div>
       )}

       {/* HR Section */}
       {hrItems.length > 0 && (
         <div className="space-y-1">
           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
             Ressources Humaines
           </h3>
           {hrItems.map((item: NavItem) => (
             <Link key={item.href} href={item.href}>
               <Button
                 variant={pathname === item.href ? "secondary" : "ghost"}
                 size="sm"
                 className={cn(
                   "w-full justify-start",
                   pathname === item.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                 )}
               >
                 <item.icon className="mr-2 h-4 w-4" />
                 {item.title}
               </Button>
             </Link>
           ))}
         </div>
       )}

       {/* Management Section */}
       {managementItems.length > 0 && (
         <div className="space-y-1">
           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
             Gestion
           </h3>
           {managementItems.map((item: NavItem) => (
             <Link key={item.href} href={item.href}>
               <Button
                 variant={pathname === item.href ? "secondary" : "ghost"}
                 size="sm"
                 className={cn(
                   "w-full justify-start",
                   pathname === item.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                 )}
               >
                 <item.icon className="mr-2 h-4 w-4" />
                 {item.title}
               </Button>
             </Link>
           ))}
         </div>
       )}

       {/* Data & Analytics Section */}
       {dataItems.length > 0 && (
         <div className="space-y-1">
           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
             Données & Analyses
           </h3>
           {dataItems.map((item: NavItem) => (
             <Link key={item.href} href={item.href}>
               <Button
                 variant={pathname === item.href ? "secondary" : "ghost"}
                 size="sm"
                 className={cn(
                   "w-full justify-start",
                   pathname === item.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                 )}
               >
                 <item.icon className="mr-2 h-4 w-4" />
                 {item.title}
               </Button>
             </Link>
           ))}
         </div>
       )}

       {/* Settings Section */}
       {settingsItems.length > 0 && (
         <div className="space-y-1 border-t border-gray-200 pt-4">
           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
             Administration
           </h3>
           {settingsItems.map((item: NavItem) => (
             <Link key={item.href} href={item.href}>
               <Button
                 variant={pathname === item.href ? "secondary" : "ghost"}
                 size="sm"
                 className={cn(
                   "w-full justify-start",
                   pathname === item.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                 )}
               >
                 <item.icon className="mr-2 h-4 w-4" />
                 {item.title}
               </Button>
             </Link>
           ))}
         </div>
       )}

       {/* Debug Info (Development only) */}
       {process.env.NODE_ENV === 'development' && (
         <div className="mt-6 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
           <div className="text-xs text-yellow-800">
             <p className="font-medium">Navigation Debug:</p>
             <p>Total items: {allNavItems.length}</p>
             <p>Visible: {visibleNavItems.length}</p>
             <p>Role: {user.role}</p>
           </div>
         </div>
       )}
     </div>
   </div>
 )
}