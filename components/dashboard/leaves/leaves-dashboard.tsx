"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckCircle, TrendingUp, Users, AlertTriangle, CalendarDays, UserX, Plus } from "lucide-react"
import { mockLeaveRequests, mockAbsences } from "@/lib/mock-data"

export function LeavesDashboard() {
  const pendingRequests = mockLeaveRequests.filter((r) => r.status === "EN_ATTENTE").length
  const approvedRequests = mockLeaveRequests.filter((r) => r.status === "APPROUVE").length
  const totalAbsences = mockAbsences.length
  const absenceRate = 2.3

  const monthlyLeaveStats = [
    { month: "Jan", approved: 12, pending: 3, rejected: 1 },
    { month: "Fév", approved: 15, pending: 2, rejected: 0 },
    { month: "Mar", approved: 18, pending: 4, rejected: 2 },
    { month: "Avr", approved: 22, pending: 1, rejected: 1 },
  ]

  const departmentLeaveStats = [
    { department: "Développement", used: 45, total: 60, rate: 75 },
    { department: "Marketing", used: 28, total: 36, rate: 78 },
    { department: "RH", used: 32, total: 48, rate: 67 },
    { department: "Finance", used: 18, total: 24, rate: 75 },
  ]

  const upcomingLeaves = [
    {
      employee: "Marie Dubois",
      department: "RH",
      startDate: "2024-02-15",
      days: 8,
      type: "CONGE_ANNUEL",
    },
    {
      employee: "Ahmed Benali",
      department: "Développement",
      startDate: "2024-02-20",
      days: 5,
      type: "CONGE_ANNUEL",
    },
    {
      employee: "Fatima Zahra",
      department: "Marketing",
      startDate: "2024-02-25",
      days: 3,
      type: "CONGE_EXCEPTIONNEL",
    },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Congés & Absences</h1>
          <p className="text-gray-600 mt-2">Suivi conforme au Code du Travail marocain</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#2d5a5a] hover:bg-[#2d5a5a]/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#f4a261] bg-gradient-to-br from-[#f4a261]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Demandes en Attente</CardTitle>
            <Clock className="h-5 w-5 text-[#f4a261]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#f4a261]">{pendingRequests}</div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-4 w-4 text-[#e76f51] mr-1" />
              <span className="text-sm text-[#e76f51] font-medium">À traiter rapidement</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Temps moyen de traitement</div>
              <div className="font-medium text-sm">2.3 jours</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2a9d8f] bg-gradient-to-br from-[#2a9d8f]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Congés Approuvés</CardTitle>
            <CheckCircle className="h-5 w-5 text-[#2a9d8f]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2a9d8f]">{approvedRequests}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-[#2a9d8f] mr-1" />
              <span className="text-sm text-[#2a9d8f] font-medium">+15% vs mois dernier</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Ce mois-ci</div>
              <div className="font-medium text-sm">67 jours au total</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#e76f51] bg-gradient-to-br from-[#e76f51]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taux d'Absence</CardTitle>
            <UserX className="h-5 w-5 text-[#e76f51]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#e76f51]">{absenceRate}%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-[#2a9d8f] mr-1" />
              <span className="text-sm text-[#2a9d8f] font-medium">-0.5% vs mois dernier</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Objectif</div>
              <div className="font-medium text-sm">{"< 3%"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2d5a5a] bg-gradient-to-br from-[#2d5a5a]/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Solde Moyen</CardTitle>
            <CalendarDays className="h-5 w-5 text-[#2d5a5a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2d5a5a]">18.5</div>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-[#f4a261] mr-1" />
              <span className="text-sm text-[#f4a261] font-medium">jours restants</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Loi marocaine</div>
              <div className="font-medium text-sm">1,5 jour/mois</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Évolution Mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2d5a5a]" />
              Évolution des Congés par Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyLeaveStats.map((stat) => (
                <div key={stat.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700 w-12">{stat.month}</div>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#2a9d8f] rounded"></div>
                      <span className="text-sm">Approuvés: {stat.approved}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#f4a261] rounded"></div>
                      <span className="text-sm">En attente: {stat.pending}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#e76f51] rounded"></div>
                      <span className="text-sm">Refusés: {stat.rejected}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#2d5a5a]">
                      {stat.approved + stat.pending + stat.rejected}
                    </div>
                    <div className="text-xs text-gray-500">total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Congés à Venir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#f4a261]" />
              Congés à Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingLeaves.map((leave, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#2d5a5a] text-white text-xs">
                      {leave.employee
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{leave.employee}</p>
                    <p className="text-xs text-gray-600">{leave.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={
                          leave.type === "CONGE_ANNUEL"
                            ? "border-[#2d5a5a] text-[#2d5a5a]"
                            : "border-[#f4a261] text-[#f4a261]"
                        }
                      >
                        {leave.days}j
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par Département */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2d5a5a]" />
              Utilisation des Congés par Département
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentLeaveStats.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-gray-600">
                      {dept.used}/{dept.total} jours ({dept.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#2d5a5a] to-[#2a9d8f] h-2 rounded-full"
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#e76f51]" />
              Alertes & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-[#f4a261]/10 border-l-4 border-[#f4a261] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-[#f4a261]" />
                  <span className="font-medium text-[#f4a261]">Demandes en attente</span>
                </div>
                <p className="text-sm text-gray-600">{pendingRequests} demandes nécessitent votre attention</p>
              </div>

              <div className="p-4 bg-[#2a9d8f]/10 border-l-4 border-[#2a9d8f] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-[#2a9d8f]" />
                  <span className="font-medium text-[#2a9d8f]">Soldes faibles</span>
                </div>
                <p className="text-sm text-gray-600">3 employés ont moins de 5 jours de congés restants</p>
              </div>

              <div className="p-4 bg-[#e76f51]/10 border-l-4 border-[#e76f51] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="h-4 w-4 text-[#e76f51]" />
                  <span className="font-medium text-[#e76f51]">Absences répétées</span>
                </div>
                <p className="text-sm text-gray-600">1 employé dépasse le seuil d'absences autorisées</p>
              </div>

              <div className="p-4 bg-[#2d5a5a]/10 border-l-4 border-[#2d5a5a] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-[#2d5a5a]" />
                  <span className="font-medium text-[#2d5a5a]">Conformité légale</span>
                </div>
                <p className="text-sm text-gray-600">Tous les congés respectent la loi marocaine (1,5j/mois)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
