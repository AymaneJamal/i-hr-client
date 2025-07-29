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
  Trash2
} from "lucide-react"

// Mock employee data
const mockEmployees = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dubois", 
    email: "marie.dubois@company.com",
    department: "Ressources Humaines",
    position: "Responsable RH",
    status: "active"
  },
  {
    id: "2", 
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@company.com", 
    department: "Informatique",
    position: "Développeur Senior",
    status: "active"
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@company.com",
    department: "Marketing", 
    position: "Chef de Projet",
    status: "inactive"
  }
]

export default function EmployeesPage() {
  return (
    <PermissionRoute permission="EMPLOYEES" level="READ">
      <div className="p-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-7 w-7 text-teal-600" />
              Gestion des Employés
            </h1>
            <p className="text-gray-600">
              Gérez vos employés et leurs informations
            </p>
            <div className="mt-2">
              <PermissionLevelBadge module="EMPLOYEES" />
            </div>
          </div>
          
          <RequirePermission permission="EMPLOYEES" level="WRITE">
            <Button className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
          </RequirePermission>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Employés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {mockEmployees.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +2 ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Employés Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockEmployees.filter(emp => emp.status === 'active').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Actuellement en service
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Départements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(mockEmployees.map(emp => emp.department)).size}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Départements actifs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un employé..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Employés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Employé
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Département
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Poste
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {employee.department}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {employee.position}
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                          className={employee.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {employee.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <RequirePermission permission="EMPLOYEES" level="WRITE">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </RequirePermission>
                          
                          <RequirePermission permission="EMPLOYEES" level="DELETE">
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
      </div>
    </PermissionRoute>
  )
}