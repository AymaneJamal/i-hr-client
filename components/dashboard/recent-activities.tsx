import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: "Sophie Martin",
    action: "a demandé un congé",
    details: "5 jours - Du 15 au 19 février",
    time: "Il y a 2 heures",
    type: "leave",
    status: "pending",
  },
  {
    id: 2,
    user: "Thomas Dubois",
    action: "a été ajouté au département",
    details: "Développement",
    time: "Il y a 4 heures",
    type: "employee",
    status: "completed",
  },
  {
    id: 3,
    user: "Marie Leroy",
    action: "a mis à jour son profil",
    details: "Informations personnelles",
    time: "Il y a 1 jour",
    type: "profile",
    status: "completed",
  },
  {
    id: 4,
    user: "Pierre Moreau",
    action: "a soumis ses heures",
    details: "40h cette semaine",
    time: "Il y a 1 jour",
    type: "timesheet",
    status: "completed",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-warning border-warning">
          En attente
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="text-success border-success">
          Terminé
        </Badge>
      )
    default:
      return <Badge variant="outline">Inconnu</Badge>
  }
}

export function RecentActivities() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Activités récentes</CardTitle>
        <CardDescription>Les dernières actions effectuées dans votre organisation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-xs text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
