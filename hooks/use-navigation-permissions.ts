// hooks/use-navigation-permissions.ts

import { usePermissions } from "@/hooks/use-permissions"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import type { PermissionModule } from "@/lib/types/permissions"
import type { HRFeatures } from "@/lib/types/auth"

export function useNavigationPermissions() {
  const { 
    user, 
    hasPermission, 
    hasAnyPermission, 
    isForbidden, 
    isAdmin 
  } = usePermissions()
  
  const { 
    hasFeature, 
    hasModule, 
    isPlanActive 
  } = usePlanFeatures()

  /**
   * Vérifie si un lien de navigation doit être affiché
   * @param permission - La permission requise pour la section
   * @param planFeature - La fonctionnalité du plan requise (optionnel)
   * @param planModule - Le module du plan requis (optionnel)
   * @returns true si le lien doit être affiché, false sinon
   */
  const shouldShowNavLink = (
    permission?: PermissionModule,
    planFeature?: keyof HRFeatures,
    planModule?: string
  ): boolean => {
    // Si l'utilisateur n'est pas connecté, ne rien afficher
    if (!user) {
      return false
    }

    // Pour les admins, vérifier seulement les contraintes du plan
    if (isAdmin()) {
      // Vérifier les contraintes du plan pour les admins
      if (planFeature && !hasFeature(planFeature)) {
        return false
      }
      
      if (planModule && !hasModule(planModule)) {
        return false
      }
      
      if (!isPlanActive()) {
        return false
      }
      
      return true
    }

    // Pour les utilisateurs non-admin, vérifier les permissions ET le plan
    if (permission) {
      // Si explicitement interdit, ne pas afficher
      if (isForbidden(permission)) {
        return false
      }

      // Si aucune permission pour ce module, ne pas afficher
      if (!hasAnyPermission(permission)) {
        return false
      }
    }

    // Vérifier les contraintes du plan
    if (planFeature && !hasFeature(planFeature)) {
      return false
    }
    
    if (planModule && !hasModule(planModule)) {
      return false
    }
    
    if (!isPlanActive()) {
      return false
    }

    return true
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une section spécifique
   * @param permission - La permission requise
   * @param level - Le niveau de permission requis ("READ", "WRITE", "DELETE")
   * @returns true si l'utilisateur peut accéder, false sinon
   */
  const canAccessSection = (
    permission: PermissionModule,
    level: "READ" | "WRITE" | "DELETE" = "READ"
  ): boolean => {
    if (!user) {
      return false
    }

    // Les admins ont accès à tout (sauf contraintes du plan)
    if (isAdmin()) {
      return isPlanActive()
    }

    // Vérifier si explicitement interdit
    if (isForbidden(permission)) {
      return false
    }

    // Vérifier la permission avec le niveau requis
    return hasPermission(permission, level)
  }

  return {
    shouldShowNavLink,
    canAccessSection,
    isForbidden,
    isAdmin: isAdmin(),
    isPlanActive: isPlanActive()
  }
}
