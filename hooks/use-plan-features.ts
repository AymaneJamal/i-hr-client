// hooks/use-plan-features.ts

import { useAppSelector } from "@/lib/hooks"
import type { Plan } from "@/lib/types/auth"

export function usePlanFeatures() {
  const { plan, authState } = useAppSelector((state) => state.auth)

  const hasFeature = (featureKey: keyof Plan["hrFeatures"]): boolean => {
    if (!plan || authState !== "AUTHENTICATED") {
      return false
    }

    // Vérifier si le plan inclut la fonctionnalité dans hrFeatures
    return plan.hrFeatures[featureKey] === true
  }

  const getLimit = (limitKey: keyof Plan["hrLimits"]): number => {
    if (!plan || authState !== "AUTHENTICATED") {
      return 0
    }

    // Récupérer la limite depuis les hrLimits du plan
    return plan.hrLimits[limitKey] || 0
  }

  const hasModule = (moduleKey: string): boolean => {
    if (!plan || authState !== "AUTHENTICATED") {
      return false
    }

    // Vérifier si le module est inclus dans le plan
    return plan.includedModules?.includes(moduleKey) || false
  }

  const isFeatureAvailable = (featureKey: keyof Plan["hrFeatures"]): boolean => {
    return hasFeature(featureKey)
  }

  const getPlanStatus = (): string => {
    return plan?.status || "UNKNOWN"
  }

  const isPlanActive = (): boolean => {
    return getPlanStatus() === "ACTIVE"
  }

  // Retourner l'objet directement, pas une fonction
  const getPlanInfo = () => {
    if (!plan) return null
    
    return {
      name: plan.planName || "Plan inconnu",
      category: plan.category || "UNKNOWN",
      maxEmployees: plan.maxEmployees || 0,
      maxUsers: plan.maxUsers || 0,
      status: plan.status || "UNKNOWN"
    }
  }

  // Calculer planInfo ici pour l'utiliser comme objet
  const planInfo = getPlanInfo()

  return {
    plan,
    hasFeature,
    getLimit,
    hasModule,
    isFeatureAvailable,
    getPlanStatus,
    isPlanActive,
    getPlanInfo,
    planInfo // Ajouter planInfo comme objet
  }
}