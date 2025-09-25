import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const appointments = [
  {
    id: 1,
    time: "09:00",
    patient: "Ana Clara Silva",
    type: "Consulta de Rotina",
    doctor: "Dr. João Santos",
    status: "confirmado",
    phone: "(11) 99999-9999",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    time: "10:30",
    patient: "Carlos Eduardo",
    type: "Retorno",
    doctor: "Dra. Maria Costa",
    status: "aguardando",
    phone: "(11) 88888-8888",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    time: "14:00",
    patient: "Lucia Fernandes",
    type: "Primeira Consulta",
    doctor: "Dr. Pedro Lima",
    status: "confirmado",
    phone: "(11) 77777-7777",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 4,
    time: "15:30",
    patient: "Roberto Santos",
    type: "Telemedicina",
    doctor: "Dra. Ana Oliveira",
    status: "online",
    phone: "(11) 66666-6666",
    avatar: "/api/placeholder/40/40"
  }
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case "confirmado":
      return "medical-status-active"
    case "aguardando":
      return "medical-status-pending"
    case "online":
      return "bg-blue-50 text-blue-700 border border-blue-200"
    default:
      return "medical-status-inactive"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmado":
      return "Confirmado"
    case "aguardando":
      return "Aguardando"
    case "online":
      return "Online"
    default:
      return "Cancelado"
  }
}

export function AppointmentsToday() {
  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendamentos de Hoje
          </div>
          <Button variant="outline" size="sm" className="text-primary hover:bg-primary/10">
            Ver todos
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="flex flex-col items-center gap-1 min-w-0">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {appointment.time}
                </span>
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={appointment.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {appointment.patient.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {appointment.patient}
                  </h4>
                  <Badge className={`text-xs px-2 py-1 ${getStatusVariant(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {appointment.type} • {appointment.doctor}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {appointment.phone}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  size="sm" 
                  className="medical-button-primary text-xs px-3"
                >
                  Iniciar
                </Button>
                {appointment.status === "online" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Video
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}