import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Calendar, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Employés actifs",
    value: "247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    color: "text-primary",
  },
  {
    title: "Départements",
    value: "8",
    change: "+1",
    changeType: "positive" as const,
    icon: Building2,
    color: "text-secondary",
  },
  {
    title: "Congés en cours",
    value: "23",
    change: "-5%",
    changeType: "negative" as const,
    icon: Calendar,
    color: "text-accent",
  },
  {
    title: "Taux de présence",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "text-success",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${stat.changeType === "positive" ? "text-success" : "text-destructive"}`}>
              {stat.change} par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
