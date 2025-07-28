"use client"

import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/ui/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronUp,
  UserCheck,
  Calendar,
  FileText,
} from "lucide-react"

const menuItems = [
  {
    title: "Employés & Départements",
    url: "/dashboard/employees",
    icon: Users,
    permission: "EMPLOYEES",
  },
  {
    title: "Congés & Absences",
    url: "/dashboard/leaves",
    icon: Calendar,
    permission: "EMPLOYEES",
  },
  {
    title: "Utilisateurs",
    url: "/dashboard/users",
    icon: UserCheck,
    permission: "TENANT_USERS",
  },
  {
    title: "Paie",
    url: "/dashboard/payroll",
    icon: CreditCard,
    permission: "PAYROLL",
  },
  {
    title: "Rapports",
    url: "/dashboard/reports",
    icon: BarChart3,
    permission: "REPORTS",
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: FileText,
    permission: "EMPLOYEES",
  },
]

export function AppSidebar() {
  const { user, logout } = useAuth()

  const hasPermission = (permission: string | null) => {
    if (!permission || !user) return true
    const userPermissions = user.permissions[permission] || []
    return !userPermissions.includes("FORBIDDEN") && userPermissions.length > 0
  }

  const filteredMenuItems = menuItems.filter((item) => hasPermission(item.permission))

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-4">
        <Logo size="md" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tableaux de bord</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.slice(0, 2).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Gestion RH</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.slice(2).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.role}</span>
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
