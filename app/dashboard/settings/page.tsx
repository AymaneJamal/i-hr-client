"use client"

import { AdminRoute } from "@/components/auth/route-protector"
import { AdminOnly } from "@/components/auth/permission-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanBadge, PlanLimitsBadge } from "@/components/ui/plan-badge"
import { AdminIndicator } from "@/components/ui/role-indicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Shield, 
  Users, 
  Database,
  Bell,
  Lock,
  CreditCard,
  Save,
  RefreshCw,
  AlertTriangle,
  Crown
} from "lucide-react"

export default function SettingsPage() {
  return (
    <AdminRoute>
      <div className="p-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3 h-7 w-7 text-purple-600" />
              Paramètres Administrateur
              <AdminIndicator className="ml-3" />
            </h1>
            <p className="text-gray-600">
              Configuration et gestion du système
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <PlanBadge showStatus={true} />
            <Button className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Admin Warning */}
        <Alert className="border-purple-200 bg-purple-50">
          <Crown className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Zone d'administration</strong> - Ces paramètres affectent l'ensemble du système.
            Modifiez-les avec précaution.
          </AlertDescription>
        </Alert>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="plan">Plan & Facturation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input id="companyName" placeholder="Votre entreprise" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Secteur d'activité</Label>
                    <Input id="industry" placeholder="Technologie" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Input id="timezone" value="UTC+1 (Paris)" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Input id="language" value="Français" readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Gestion des Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">15</div>
                    <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                    <PlanLimitsBadge type="users" className="mt-2" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">45</div>
                    <div className="text-sm text-gray-600">Employés</div>
                    <PlanLimitsBadge type="employees" className="mt-2" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">5</div>
                    <div className="text-sm text-gray-600">Départements</div>
                    <PlanLimitsBadge type="departments" className="mt-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inscription automatique</Label>
                      <p className="text-sm text-gray-500">
                        Permettre aux nouveaux utilisateurs de s'inscrire
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Vérification email obligatoire</Label>
                      <p className="text-sm text-gray-500">
                        Exiger la vérification email pour les nouveaux comptes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Paramètres de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Authentification à deux facteurs (2FA)</Label>
                      <p className="text-sm text-gray-500">
                        Exiger 2FA pour tous les utilisateurs
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sessions multiples</Label>
                      <p className="text-sm text-gray-500">
                        Permettre la connexion sur plusieurs appareils
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Expiration de session</Label>
                      <p className="text-sm text-gray-500">
                        Durée avant déconnexion automatique
                      </p>
                    </div>
                    <Input className="w-32" value="24 heures" />
                  </div>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <Lock className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Les modifications de sécurité affectent tous les utilisateurs immédiatement.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan & Billing */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Plan et Facturation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-teal-900">Plan Actuel</h3>
                      <PlanBadge size="lg" showStatus={true} className="mt-2" />
                    </div>
                    <Button variant="outline">
                      Changer de plan
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Limites du plan</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisateurs</span>
                        <PlanLimitsBadge type="users" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Employés</span>
                        <PlanLimitsBadge type="employees" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Départements</span>
                        <PlanLimitsBadge type="departments" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Prochaine facturation</h4>
                    <div className="text-sm text-gray-600">
                      <p>15 février 2025</p>
                      <p className="font-medium text-lg text-gray-900 mt-1">5,000 MAD</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications email</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir les alertes système par email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications push</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir les notifications dans le navigateur
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rapports hebdomadaires</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir un résumé des activités chaque semaine
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <AdminOnly>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Actions Administrateur</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Actions critiques nécessitant des privilèges administrateur
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Synchroniser
                  </Button>
                  
                  <Button variant="destructive" className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminOnly>
      </div>
    </AdminRoute>
  )
}