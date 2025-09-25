import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Activity, 
  Video,
  Phone,
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Plus,
  Eye,
  Download,
  Send,
  Mic,
  Camera
} from "lucide-react"
import { useState } from "react"

const telemedicineSessions = [
  {
    id: 1,
    patient: "Maria Santos Silva",
    doctor: "Dr. João Santos",
    date: "2024-01-15",
    time: "14:00",
    duration: "30 min",
    status: "concluida",
    type: "video",
    notes: "Consulta de rotina - Pressão controlada",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    patient: "Carlos Eduardo",
    doctor: "Dra. Maria Costa",
    date: "2024-01-15",
    time: "15:30",
    duration: "45 min",
    status: "em_andamento",
    type: "video",
    notes: "Consulta cardiológica",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    patient: "Ana Lucia Costa",
    doctor: "Dr. Pedro Lima",
    date: "2024-01-14",
    time: "10:00",
    duration: "25 min",
    status: "concluida",
    type: "audio",
    notes: "Consulta neurológica",
    avatar: "/api/placeholder/40/40"
  }
]

const patientMessages = [
  {
    id: 1,
    patient: "Roberto Santos",
    message: "Olá doutor, gostaria de saber sobre o resultado do meu exame...",
    time: "09:30",
    status: "nao_lida",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    patient: "Lucia Fernandes",
    message: "Obrigada pela consulta de ontem! Já estou me sentindo melhor.",
    time: "08:45",
    status: "lida",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 3,
    patient: "Pedro Costa",
    message: "Preciso reagendar minha consulta para próxima semana.",
    time: "07:20",
    status: "nao_lida",
    avatar: "/api/placeholder/32/32"
  }
]

const onlinePatients = [
  {
    id: 1,
    name: "Carlos Eduardo",
    status: "online",
    lastActivity: "2 min atrás",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    name: "Ana Lucia Costa",
    status: "online",
    lastActivity: "5 min atrás",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    name: "Roberto Santos",
    status: "away",
    lastActivity: "15 min atrás",
    avatar: "/api/placeholder/40/40"
  }
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case "concluida":
      return "medical-status-active"
    case "em_andamento":
      return "medical-status-pending"
    case "agendada":
      return "medical-status-active"
    case "cancelada":
      return "medical-status-inactive"
    case "lida":
      return "medical-status-active"
    case "nao_lida":
      return "medical-status-pending"
    case "online":
      return "medical-status-active"
    case "away":
      return "medical-status-pending"
    default:
      return "medical-status-pending"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "concluida":
    case "lida":
      return <CheckCircle className="w-4 h-4" />
    case "em_andamento":
    case "nao_lida":
      return <Clock className="w-4 h-4" />
    case "online":
      return <Activity className="w-4 h-4" />
    case "away":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const Portal = () => {
  const [selectedTab, setSelectedTab] = useState("telemedicina")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <AppLayout 
      title="Portal Paciente" 
      subtitle="Telemedicina e comunicação com pacientes"
    >
      <div className="space-y-6">
        {/* Portal Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Consultas Online
                  </p>
                  <h3 className="text-2xl font-bold text-primary">
                    12
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pacientes Online
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    {onlinePatients.filter(p => p.status === "online").length}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conectados agora
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-green-soft flex items-center justify-center">
                  <Activity className="w-6 h-6 text-medical-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Mensagens
                  </p>
                  <h3 className="text-2xl font-bold text-medical-amber">
                    {patientMessages.filter(m => m.status === "nao_lida").length}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Não lidas
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-amber-soft flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-medical-amber" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tempo Médio
                  </p>
                  <h3 className="text-2xl font-bold text-foreground">
                    28 min
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por consulta
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Button className="medical-button-primary h-20 flex flex-col gap-2">
            <Video className="w-6 h-6" />
            <span>Nova Consulta</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-primary/10">
            <Phone className="w-6 h-6" />
            <span>Chamada de Voz</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-medical-green/10">
            <MessageCircle className="w-6 h-6" />
            <span>Mensagens</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-medical-amber/10">
            <Calendar className="w-6 h-6" />
            <span>Agendar Online</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <Button
            variant={selectedTab === "telemedicina" ? "default" : "ghost"}
            onClick={() => setSelectedTab("telemedicina")}
            className="medical-button-primary"
          >
            <Video className="w-4 h-4 mr-2" />
            Telemedicina
          </Button>
          <Button
            variant={selectedTab === "mensagens" ? "default" : "ghost"}
            onClick={() => setSelectedTab("mensagens")}
            className="hover:bg-primary/10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Mensagens
          </Button>
          <Button
            variant={selectedTab === "online" ? "default" : "ghost"}
            onClick={() => setSelectedTab("online")}
            className="hover:bg-primary/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Pacientes Online
          </Button>
        </div>

        {/* Telemedicine Sessions */}
        {selectedTab === "telemedicina" && (
          <Card className="medical-card">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Sessões de Telemedicina
                </CardTitle>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar paciente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button className="medical-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Sessão
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {telemedicineSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={session.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.patient.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {session.patient}
                        </h4>
                        <Badge className={`text-xs px-2 py-1 ${getStatusVariant(session.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            {session.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.doctor} • {session.type === 'video' ? 'Videochamada' : 'Chamada de voz'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.time}</span>
                        </div>
                        <span>Duração: {session.duration}</span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {session.status === "em_andamento" ? (
                        <Button size="sm" className="medical-button-primary">
                          <Video className="w-3 h-3 mr-1" />
                          Entrar
                        </Button>
                      ) : (
                        <Button size="sm" className="medical-button-primary">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="hover:bg-primary/10">
                        <FileText className="w-3 h-3 mr-1" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Messages */}
        {selectedTab === "mensagens" && (
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Mensagens dos Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {patientMessages.map((message) => (
                  <div key={message.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {message.patient.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {message.patient}
                        </h4>
                        <Badge className={`text-xs px-2 py-1 ${getStatusVariant(message.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            {message.status.replace('_', ' ')}
                          </div>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.message}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="medical-button-primary">
                        <Send className="w-3 h-3 mr-1" />
                        Responder
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-primary/10">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Online Patients */}
        {selectedTab === "online" && (
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Pacientes Online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {onlinePatients.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {patient.name}
                        </h4>
                        <Badge className={`text-xs px-2 py-1 ${getStatusVariant(patient.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(patient.status)}
                            {patient.status}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Última atividade: {patient.lastActivity}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="medical-button-primary">
                        <Video className="w-3 h-3 mr-1" />
                        Chamar
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-primary/10">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Mensagem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Portal;
