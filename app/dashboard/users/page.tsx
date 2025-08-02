"use client"

import { PermissionRoute } from "@/components/auth/route-protector"
import { RequirePermission } from "@/components/auth/permission-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PermissionLevelBadge } from "@/components/ui/role-indicator"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react"
import Link from "next/link"

// Mock users data - à remplacer par de vraies données API
const mockUsers = [
  {
    id: "tenant-user-1",
    firstName: "Marie",
    lastName: "Dubois", 
    email: "marie.dubois@company.com",
    companyRole: "Responsable RH",
    role: "TENANT_USER",
    status: "ACTIVE",
    createdAt: 1654059047476,
    lastLoginAt: 1654159047476
  },
  {
    id: "tenant-user-2", 
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@company.com", 
    companyRole: "Développeur Senior",
    role: "TENANT_USER",
    status: "ACTIVE",
    createdAt: 1654059047476,
    lastLoginAt: null
  },
  {
    id: "tenant-user-3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@company.com",
    companyRole: "Chef de Projet",
    role: "TENANT_HELPER",
    status: "INACTIVE",
    createdAt: 1654059047476,
    lastLoginAt: 1654059047476
  }
]

export default function UsersPage() {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Jamais"
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "TENANT_ADMIN": return "Administrateur"
      case "TENANT_USER": return "Utilisateur"
      case "TENANT_HELPER": return "Assistant"
      default: return role
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Actif
          </Badge>
        )
      case "INACTIVE":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactif
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <PermissionRoute permission="TENANT_USERS" level="READ">
      <div className="p-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-7 w-7 text-teal-600" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérez les utilisateurs de votre tenant
            </p>
            <div className="mt-2">
              <PermissionLevelBadge module="TENANT_USERS" className="text-xs" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            
            <RequirePermission permission="TENANT_USERS" level="WRITE">
              <Link href="/dashboard/users/create">
                <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nouvel utilisateur
                </Button>
              </Link>
            </RequirePermission>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {mockUsers.length} utilisateur(s) au total
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-teal-600" />
              Liste des utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.companyRole}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline" 
                          className={
                            user.role === "TENANT_ADMIN" 
                              ? "border-purple-300 text-purple-700 bg-purple-50"
                              : user.role === "TENANT_USER"
                              ? "border-blue-300 text-blue-700 bg-blue-50"
                              : "border-green-300 text-green-700 bg-green-50"
                          }
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastLoginAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-teal-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <RequirePermission permission="TENANT_USERS" level="WRITE">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </RequirePermission>
                          
                          <RequirePermission permission="TENANT_USERS" level="DELETE">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </RequirePermission>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Total utilisateurs
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUsers.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Utilisateurs actifs
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUsers.filter(u => u.status === "ACTIVE").length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Nouveaux ce mois
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUsers.filter(u => {
                      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
                      return u.createdAt > oneMonthAgo
                    }).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Administrateurs
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUsers.filter(u => u.role === "TENANT_ADMIN").length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </PermissionRoute>
  )
}