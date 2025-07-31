"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppDispatch } from "@/lib/hooks"
import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { logout } from "@/lib/store/auth-slice"
import type { UserRole } from "@/lib/types/auth"
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut, 
  Calendar, 
  BarChart3,
  Building2,
  Crown,
  UserCheck
} from "lucide-react"

interface RoleConfig {
  label: string
  shortLabel: string
  icon: typeof Crown
  color: string
  darkColor: string
  priority: number
}

export function ConditionalNavbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  const { user, hasAnyPermission } = usePermissions()
  const { planInfo, isPlanActive } = usePlanFeatures()

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  // Generate user initials from firstName and lastName
  const getUserInitials = () => {
    if (!user) return "U"
    const firstInitial = user.firstName?.charAt(0) || ""
    const lastInitial = user.lastName?.charAt(0) || ""
    return (firstInitial + lastInitial).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User"
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email
  }

  // Get role display info
  const getRoleInfo = (): RoleConfig | null => {
    if (!user) return null
    
    const roleConfig: Record<string, RoleConfig> = {
      TENANT_ADMIN: {
        label: "Administrateur",
        shortLabel: "Admin",
        icon: Crown,
        color: "bg-purple-100 text-purple-800",
        darkColor: "dark:bg-purple-900 dark:text-purple-200",
        priority: 3
      },
      TENANT_USER: {
        label: "Utilisateur",
        shortLabel: "User",
        icon: UserCheck,
        color: "bg-blue-100 text-blue-800",
        darkColor: "dark:bg-blue-900 dark:text-blue-200", 
        priority: 2
      },
      TENANT_HELPER: {
        label: "Assistant",
        shortLabel: "Helper",
        icon: User,
        color: "bg-green-100 text-green-800",
        darkColor: "dark:bg-green-900 dark:text-green-200",
        priority: 1
      }
    }

    return roleConfig[user.role] || null
  }

  const roleInfo = getRoleInfo()

  if (!user) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Left Section - Logo & Company Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">i-RH Client</h1>
              {planInfo && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{planInfo.name}</span>
                  <Badge 
                    variant={isPlanActive() ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {planInfo.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center space-x-4">
          
          {/* Quick Actions - Only show if user has permissions */}
          <div className="flex items-center space-x-2">
            
            {/* Calendar - Only if has employee permissions */}
            {hasAnyPermission("EMPLOYEES") && (
              <Button variant="ghost" size="sm" className="p-2">
                <Calendar className="h-4 w-4" />
              </Button>
            )}

            {/* Reports - Only if has reports permissions */}
            {hasAnyPermission("REPORTS") && (
              <Button variant="ghost" size="sm" className="p-2">
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="p-2">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2">
                <div className="flex items-center space-x-3">
                  
                  {/* Role Badge */}
                  {roleInfo && (
                    <div className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                      roleInfo.color
                    )}>
                      <roleInfo.icon className="h-3 w-3" />
                      <span>{roleInfo.label}</span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.companyRole && (
                    <p className="text-xs text-gray-400">{user.companyRole}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}