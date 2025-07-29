"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Crown, Shield, Star, Zap, AlertTriangle } from "lucide-react"

interface PlanBadgeProps {
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  showStatus?: boolean
  className?: string
}

export function PlanBadge({ 
  variant = "default",
  size = "md", 
  showIcon = true,
  showStatus = false,
  className 
}: PlanBadgeProps) {
  const { plan, isPlanActive } = usePlanFeatures()
  
  if (!plan) {
    return (
      <Badge variant="destructive" className={cn("flex items-center space-x-1", className)}>
        <AlertTriangle className="h-3 w-3" />
        <span>Aucun plan</span>
      </Badge>
    )
  }

  // Plan category configuration
  const planConfig = {
    GOLD: {
      label: "Gold",
      icon: Crown,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      darkColor: "dark:bg-yellow-900 dark:text-yellow-200"
    },
    SILVER: {
      label: "Silver", 
      icon: Shield,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      darkColor: "dark:bg-gray-800 dark:text-gray-200"
    },
    BRONZE: {
      label: "Bronze",
      icon: Star,
      color: "bg-orange-100 text-orange-800 border-orange-300", 
      darkColor: "dark:bg-orange-900 dark:text-orange-200"
    },
    PREMIUM: {
      label: "Premium",
      icon: Zap,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      darkColor: "dark:bg-purple-900 dark:text-purple-200"
    }
  }

  const config = planConfig[plan.category as keyof typeof planConfig] || planConfig.SILVER
  const Icon = config.icon

  // Size configuration
  const sizeConfig = {
    sm: {
      badge: "text-xs px-2 py-1",
      icon: "h-3 w-3"
    },
    md: {
      badge: "text-sm px-3 py-1.5", 
      icon: "h-4 w-4"
    },
    lg: {
      badge: "text-base px-4 py-2",
      icon: "h-5 w-5"
    }
  }

  const sizes = sizeConfig[size]

  // Status indicator
  const statusConfig = {
    active: {
      color: "bg-green-500",
      label: "Actif"
    },
    inactive: {
      color: "bg-red-500", 
      label: "Inactif"
    }
  }

  const status = isPlanActive ? statusConfig.active : statusConfig.inactive

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge 
        variant={variant === "default" ? undefined : variant}
        className={cn(
          "flex items-center space-x-1 border",
          sizes.badge,
          variant === "default" && config.color,
          variant === "default" && config.darkColor
        )}
      >
        {showIcon && <Icon className={sizes.icon} />}
        <span className="font-medium">{plan.planName}</span>
        <span className="text-xs opacity-75">({config.label})</span>
      </Badge>

      {showStatus && (
        <div className="flex items-center space-x-1">
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              status.color
            )}
          />
          <span className="text-xs text-gray-500">{status.label}</span>
        </div>
      )}
    </div>
  )
}

// Specific plan badges for common use cases
export function PlanNameBadge({ className }: { className?: string }) {
  return (
    <PlanBadge 
      variant="outline"
      size="sm"
      showIcon={false}
      className={className}
    />
  )
}

export function PlanStatusBadge({ className }: { className?: string }) {
  return (
    <PlanBadge 
      variant="secondary"
      size="sm"
      showStatus={true}
      className={className}
    />
  )
}

export function PlanCategoryBadge({ className }: { className?: string }) {
  const { plan } = usePlanFeatures()

  if (!plan) return null

  const categoryColors = {
    GOLD: "bg-yellow-500 text-white",
    SILVER: "bg-gray-500 text-white", 
    BRONZE: "bg-orange-500 text-white",
    PREMIUM: "bg-purple-500 text-white"
  }

  const color = categoryColors[plan.category as keyof typeof categoryColors] || categoryColors.SILVER

  return (
    <Badge className={cn(color, "text-xs font-medium", className)}>
      {plan.category}
    </Badge>
  )
}

// Plan limits indicator
export function PlanLimitsBadge({ 
  type = "users",
  className 
}: { 
  type?: "users" | "employees" | "departments"
  className?: string 
}) {
  const { plan } = usePlanFeatures()

  if (!plan) return null

  const limits = {
    users: {
      value: plan.maxUsers,
      label: "utilisateurs"
    },
    employees: {
      value: plan.maxEmployees,
      label: "employés"
    },
    departments: {
      value: plan.maxDepartments,
      label: "départements"
    }
  }

  const limit = limits[type]

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {limit.value} {limit.label} max
    </Badge>
  )
}