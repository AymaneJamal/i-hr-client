// hooks/use-plan-features.ts

import { useMemo } from "react"
import { useAppSelector } from "@/lib/hooks"
import type { HRFeatures } from "@/lib/types/auth"

export function usePlanFeatures() {
  const { plan } = useAppSelector((state: any) => state.auth)

  const hasFeature = useMemo(() => {
    return (feature: keyof HRFeatures): boolean => {
      if (!plan) return false
      return plan.hrFeatures[feature] === true
    }
  }, [plan])

  const hasModule = useMemo(() => {
    return (module: string): boolean => {
      if (!plan) return false
      return plan.includedModules.includes(module)
    }
  }, [plan])

  const getPlanLimits = useMemo(() => {
    return plan?.hrLimits || null
  }, [plan])

  const getPlanInfo = useMemo(() => {
    if (!plan) return null
    
    return {
      name: plan.planName,
      category: plan.category,
      maxUsers: plan.maxUsers,
      maxEmployees: plan.maxEmployees,
      maxDepartments: plan.maxDepartments,
      maxReports: plan.maxReports
    }
  }, [plan])

  const getFeatureStatus = useMemo(() => {
    return (feature: keyof HRFeatures): "enabled" | "disabled" | "unavailable" => {
      if (!plan) return "unavailable"
      return plan.hrFeatures[feature] ? "enabled" : "disabled"
    }
  }, [plan])

  const getAllEnabledFeatures = useMemo(() => {
    if (!plan) return []
    
    return Object.entries(plan.hrFeatures)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature as keyof HRFeatures)
  }, [plan])

  const getAllIncludedModules = useMemo(() => {
    return plan?.includedModules || []
  }, [plan])

  const isPlanActive = useMemo(() => {
    return plan?.status === "ACTIVE"
  }, [plan])

  const isFeatureInPlan = useMemo(() => {
    return (feature: keyof HRFeatures): boolean => {
      if (!plan) return false
      // Check if feature exists in plan and is enabled
      return hasFeature(feature) && isPlanActive
    }
  }, [plan, hasFeature, isPlanActive])

  const canAccessModule = useMemo(() => {
    return (module: string): boolean => {
      if (!plan) return false
      // Check if module is included in plan and plan is active
      return hasModule(module) && isPlanActive
    }
  }, [plan, hasModule, isPlanActive])

  return {
    hasFeature,
    hasModule,
    isFeatureInPlan,
    canAccessModule,
    getFeatureStatus,
    getPlanLimits,
    getPlanInfo,
    getAllEnabledFeatures,
    getAllIncludedModules,
    isPlanActive,
    plan
  }
}