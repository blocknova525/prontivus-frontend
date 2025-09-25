import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, FileText, Calendar } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "consulta",
    patient: "Maria Silva",
    doctor: "Dr. João Santos",
    time: "14:30",
    status: "finalizada",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    type: "agendamento",
    patient: "Pedro Costa",
    doctor: "Dra. Ana Oliveira",
    time: "15:00",
    status: "agendado",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 3,
    type: "receita",
    patient: "Carlos Mendes",
    doctor: "Dr. João Santos",
    time: "13:45",
    status: "emitida",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 4,
    type: "exame",
    patient: "Lucia Ferreira",
    doctor: "Dra. Marina Costa",
    time: "12:30",
    status: "solicitado",
    avatar: "/api/placeholder/32/32"
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case "consulta":
      return <User className="w-4 h-4" />
    case "agendamento":
      return <Calendar className="w-4 h-4" />
    case "receita":
      return <FileText className="w-4 h-4" />
    case "exame":
      return <FileText className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "finalizada":
    case "emitida":
      return "medical-status-active"
    case "agendado":
    case "solicitado":
      return "medical-status-pending"
    default:
      return "medical-status-inactive"
  }
}

export function RecentActivity() {
  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm text-foreground">
                    {activity.patient}
                  </p>
                  <Badge className={`text-xs px-2 py-1 ${getStatusVariant(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.doctor} • {activity.time}
                </p>
              </div>

              <Avatar className="w-8 h-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback className="text-xs bg-muted">
                  {activity.patient.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}