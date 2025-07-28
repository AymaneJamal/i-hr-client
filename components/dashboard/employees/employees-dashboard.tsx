"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, Building2, TrendingUp, UserPlus, Clock, Award, Target, Activity, MoreHorizontal } from "lucide-react"
import { mockEmployees, mockDepartments } from "@/lib/mock-data"

export function EmployeesDashboard() {
  const totalEmployees = mockEmployees.filter((e) => e.status === "ACTIF").length
  const cdiEmployees = mockEmployees.filter((e) => e.contractType === "CDI" && e.status === "ACTIF").length
  const cddEmployees = mockEmployees.filter((e) => e.contractType === "CDD" && e.status === "ACTIF").length
  const newEmployeesThisMonth = 3
  const departmentStats = mockDepartments.map((dept) => ({
    ...dept,
    employees: mockEmployees.filter((emp) => emp.department === dept.name && emp.status === "ACTIF"),
  }))

  const recentActivities = [
    {
      id: 1,
      employee: "Sophie Martin",
      action: "Nouveau contrat CDI",
      department: "Marketing",
      time: "Il y a 2h",
      status: "completed",
    },
    {
      id: 2,
      employee: "Ahmed Benali",
      action: "Promotion - Lead Developer",
      department: "Développement",
      time: "Il y a 1 jour",
      status: "completed",
    },
    {
      id: 3,
      employee: "Fatima Zahra",
      action: "Fin de période d'essai",
      department: "RH",
      time: "Il y a 2 jours",
      status: "pending",
    },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Employés & Départements</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble des ressources humaines</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#2d5a5a] hover:bg-[#2d5a5a]/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter employé
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#2d5a5a] bg-gradient-to-br from-[#2d5a5a]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employés</CardTitle>
            <Users className="h-5 w-5 text-[#2d5a5a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2d5a5a]">{totalEmployees}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-[#2a9d8f] mr-1" />
              <span className="text-sm text-[#2a9d8f] font-medium">+12% ce mois</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">CDI</span>
                <span className="font-medium">{cdiEmployees}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">CDD</span>
                <span className="font-medium">{cddEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#f4a261] bg-gradient-to-br from-[#f4a261]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Départements Actifs</CardTitle>
            <Building2 className="h-5 w-5 text-[#f4a261]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#f4a261]">{mockDepartments.length}</div>
            <div className="flex items-center mt-2">
              <Target className="h-4 w-4 text-[#2a9d8f] mr-1" />
              <span className="text-sm text-[#2a9d8f] font-medium">100% opérationnels</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Plus grand département</div>
              <div className="font-medium text-sm">Développement (15)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2a9d8f] bg-gradient-to-br from-[#2a9d8f]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nouveaux Employés</CardTitle>
            <UserPlus className="h-5 w-5 text-[#2a9d8f]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2a9d8f]">{newEmployeesThisMonth}</div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-[#f4a261] mr-1" />
              <span className="text-sm text-[#f4a261] font-medium">Ce mois-ci</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Taux de rétention</div>
              <div className="font-medium text-sm">94.2%</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#e76f51] bg-gradient-to-br from-[#e76f51]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Performance Globale</CardTitle>
            <Award className="h-5 w-5 text-[#e76f51]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#e76f51]">87%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-[#2a9d8f] mr-1" />
              <span className="text-sm text-[#2a9d8f] font-medium">+3% vs mois dernier</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Satisfaction employés</div>
              <div className="font-medium text-sm">9.1/10</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Répartition par Département */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#2d5a5a]" />
              Répartition par Département
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Responsable: {dept.manager}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: dept.color }}>
                      {dept.employees.length}
                    </div>
                    <div className="text-xs text-gray-500">employés</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activités Récentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#f4a261]" />
                Activités Récentes
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#2d5a5a] text-white text-xs">
                      {activity.employee
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.employee}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.department}
                      </Badge>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "completed" ? "bg-[#2a9d8f]" : "bg-[#f4a261]"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Types de Contrats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2d5a5a]" />
              Répartition des Contrats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#2a9d8f]/10 to-transparent rounded-lg border-l-4 border-[#2a9d8f]">
                <div>
                  <h3 className="font-semibold text-[#2a9d8f]">CDI</h3>
                  <p className="text-sm text-gray-600">Contrats à Durée Indéterminée</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#2a9d8f]">{cdiEmployees}</div>
                  <div className="text-xs text-gray-500">{Math.round((cdiEmployees / totalEmployees) * 100)}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f4a261]/10 to-transparent rounded-lg border-l-4 border-[#f4a261]">
                <div>
                  <h3 className="font-semibold text-[#f4a261]">CDD</h3>
                  <p className="text-sm text-gray-600">Contrats à Durée Déterminée</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#f4a261]">{cddEmployees}</div>
                  <div className="text-xs text-gray-500">{Math.round((cddEmployees / totalEmployees) * 100)}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e76f51]/10 to-transparent rounded-lg border-l-4 border-[#e76f51]">
                <div>
                  <h3 className="font-semibold text-[#e76f51]">Période d'Essai</h3>
                  <p className="text-sm text-gray-600">Nouveaux employés</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#e76f51]">2</div>
                  <div className="text-xs text-gray-500">5%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2d5a5a]" />
              Évolution des Effectifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#2d5a5a] mb-2">{totalEmployees}</div>
                <div className="text-sm text-gray-600">Employés Actifs</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#2a9d8f]/10 rounded-lg">
                  <div className="text-lg font-bold text-[#2a9d8f]">+3</div>
                  <div className="text-xs text-gray-600">Ce mois</div>
                </div>
                <div className="p-3 bg-[#f4a261]/10 rounded-lg">
                  <div className="text-lg font-bold text-[#f4a261]">+8</div>
                  <div className="text-xs text-gray-600">Ce trimestre</div>
                </div>
                <div className="p-3 bg-[#e76f51]/10 rounded-lg">
                  <div className="text-lg font-bold text-[#e76f51]">1</div>
                  <div className="text-xs text-gray-600">Départ</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Objectif annuel</span>
                  <span className="font-medium">50 employés</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#2d5a5a] to-[#2a9d8f] h-2 rounded-full"
                    style={{ width: `${(totalEmployees / 50) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((totalEmployees / 50) * 100)}% de l'objectif atteint
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
