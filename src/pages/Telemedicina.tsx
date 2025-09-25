import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Video, 
  CalendarIcon, 
  User, 
  Clock, 
  Phone,
  MessageCircle,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Users,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const Telemedicina = () => {
  const [activeTab, setActiveTab] = useState<'agendar' | 'consultas' | 'sala'>('agendar')
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    appointmentType: "telemedicina",
    date: new Date(),
    time: "",
    duration: "30",
    notes: "",
    platform: "zoom"
  })

  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const doctors = [
    { id: 1, name: "Dr. João Santos", specialty: "Clínica Geral", available: true },
    { id: 2, name: "Dra. Maria Costa", specialty: "Cardiologia", available: true },
    { id: 3, name: "Dr. Pedro Lima", specialty: "Neurologia", available: false },
    { id: 4, name: "Dra. Ana Oliveira", specialty: "Endocrinologia", available: true }
  ]

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ]

  const platforms = [
    { value: "zoom", label: "Zoom", icon: Video },
    { value: "teams", label: "Microsoft Teams", icon: Users },
    { value: "meet", label: "Google Meet", icon: Video },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }
  ]

  const upcomingConsultations = [
    {
      id: 1,
      patient: "Maria Silva",
      doctor: "Dr. João Santos",
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      platform: "zoom",
      status: "agendado",
      link: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      patient: "João Santos",
      doctor: "Dra. Maria Costa",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      platform: "teams",
      status: "agendado",
      link: "https://teams.microsoft.com/l/meetup-join/..."
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Consulta de telemedicina agendada:", formData)
    alert("Consulta de telemedicina agendada com sucesso!")
    setActiveTab('consultas')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({ 
      ...prev, 
      patientId: patient.id,
      patientName: patient.name
    }))
    setShowPatientSearch(false)
  }

  const startConsultation = (consultation: any) => {
    setIsInCall(true)
    console.log("Iniciando consulta:", consultation)
  }

  const endConsultation = () => {
    setIsInCall(false)
    setIsMuted(false)
    setIsVideoOff(false)
    console.log("Consulta finalizada")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
      case 'em_andamento':
        return <Badge className="bg-green-100 text-green-800">Em Andamento</Badge>
      case 'finalizado':
        return <Badge className="bg-gray-100 text-gray-800">Finalizado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AppLayout 
      title="Telemedicina" 
      subtitle="Consultas médicas online e agendamentos virtuais"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <Button
            variant={activeTab === 'agendar' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('agendar')}
            className={activeTab === 'agendar' ? 'medical-button-primary' : ''}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
          <Button
            variant={activeTab === 'consultas' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('consultas')}
            className={activeTab === 'consultas' ? 'medical-button-primary' : ''}
          >
            <Video className="w-4 h-4 mr-2" />
            Próximas Consultas
          </Button>
          <Button
            variant={activeTab === 'sala' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sala')}
            className={activeTab === 'sala' ? 'medical-button-primary' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Sala Virtual
          </Button>
        </div>

        {/* Schedule Consultation Tab */}
        {activeTab === 'agendar' && (
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Agendar Consulta de Telemedicina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Informações do Paciente</h3>
                  <div>
                    <Label htmlFor="patientSearch">Paciente *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="patientSearch"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange("patientName", e.target.value)}
                        placeholder="Digite o nome ou CPF do paciente"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowPatientSearch(true)}
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Médico Responsável</h3>
                  <div>
                    <Label htmlFor="doctor">Médico *</Label>
                    <Select value={formData.doctorId} onValueChange={(value) => {
                      const doctor = doctors.find(d => d.id.toString() === value)
                      handleInputChange("doctorId", value)
                      handleInputChange("doctorName", doctor?.name || "")
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.available).map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{doctor.name}</span>
                              <span className="text-sm text-muted-foreground">- {doctor.specialty}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.date, "dd/MM/yyyy", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => date && handleInputChange("date", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Horário *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duração *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Plataforma de Videochamada</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {platforms.map((platform) => {
                      const Icon = platform.icon
                      return (
                        <Button
                          key={platform.value}
                          type="button"
                          variant={formData.platform === platform.value ? "default" : "outline"}
                          className={`h-20 flex flex-col gap-2 ${
                            formData.platform === platform.value ? "medical-button-primary" : ""
                          }`}
                          onClick={() => handleInputChange("platform", platform.value)}
                        >
                          <Icon className="w-6 h-6" />
                          <span>{platform.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observações sobre a consulta de telemedicina..."
                    rows={3}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('consultas')}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit" className="medical-button-primary">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Consultations Tab */}
        {activeTab === 'consultas' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Próximas Consultas de Telemedicina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <Card key={consultation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {consultation.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{consultation.patient}</h4>
                            <p className="text-sm text-muted-foreground">{consultation.doctor}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm">
                                {format(consultation.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(consultation.status)}
                          <Button
                            size="sm"
                            className="medical-button-primary"
                            onClick={() => startConsultation(consultation)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Virtual Room Tab */}
        {activeTab === 'sala' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Sala Virtual de Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isInCall ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma consulta em andamento</h3>
                    <p className="text-muted-foreground mb-6">
                      Inicie uma consulta de telemedicina para usar a sala virtual
                    </p>
                    <Button 
                      className="medical-button-primary"
                      onClick={() => setActiveTab('consultas')}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Ver Consultas Agendadas
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Video Call Interface */}
                    <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Avatar className="w-20 h-20 mx-auto mb-4">
                            <AvatarFallback className="text-2xl">MS</AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-semibold">Maria Silva</h3>
                          <p className="text-gray-300">Paciente</p>
                        </div>
                      </div>
                      
                      {/* Call Controls */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                          <Button
                            size="sm"
                            variant={isMuted ? "destructive" : "secondary"}
                            onClick={toggleMute}
                          >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant={isVideoOff ? "destructive" : "secondary"}
                            onClick={toggleVideo}
                          >
                            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={endConsultation}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Call Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Informações da Consulta</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Paciente:</span>
                            <span>Maria Silva</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Médico:</span>
                            <span>Dr. João Santos</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duração:</span>
                            <span>15 min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className="bg-green-100 text-green-800">Em Andamento</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Controles da Consulta</h4>
                        <div className="space-y-2">
                          <Button className="w-full" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurações
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Convidar Participante
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default Telemedicina
