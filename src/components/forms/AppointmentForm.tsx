import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, User, Stethoscope, Save, X, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface AppointmentFormProps {
  onSave: (appointment: any) => void
  onCancel: () => void
  initialData?: any
}

const doctors = [
  { id: 1, name: "Dr. João Santos", specialty: "Clínica Geral" },
  { id: 2, name: "Dra. Maria Costa", specialty: "Cardiologia" },
  { id: 3, name: "Dr. Pedro Lima", specialty: "Neurologia" },
  { id: 4, name: "Dra. Ana Oliveira", specialty: "Endocrinologia" }
]

const appointmentTypes = [
  "Consulta de Rotina",
  "Primeira Consulta",
  "Retorno",
  "Telemedicina",
  "Exame",
  "Urgência"
]

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
]

export function AppointmentForm({ onSave, onCancel, initialData }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patientId: initialData?.patientId || "",
    patientName: initialData?.patientName || "",
    doctorId: initialData?.doctorId || "",
    appointmentType: initialData?.appointmentType || "",
    date: initialData?.date || undefined,
    time: initialData?.time || "",
    duration: initialData?.duration || "30",
    notes: initialData?.notes || "",
    priority: initialData?.priority || "normal",
    insurance: initialData?.insurance || "",
    status: initialData?.status || "agendado"
  })

  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Transform form data to API format
      const appointmentData = {
        patient_id: parseInt(formData.patientId),
        doctor_id: parseInt(formData.doctorId),
        appointment_date: formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date,
        appointment_time: formData.time,
        duration_minutes: parseInt(formData.duration),
        type: formData.appointmentType.toLowerCase().replace(/\s+/g, '_'),
        status: formData.status,
        notes: formData.notes,
        reason: formData.priority,
        location: "Consultório",
        reminder_sent: false
      }
      
      // Ensure required fields are present
      if (!appointmentData.type) {
        appointmentData.type = "consultation"
      }
      if (!appointmentData.status) {
        appointmentData.status = "scheduled"
      }
      
      console.log('DEBUG: Sending appointment data:', appointmentData)
      
      // Validate required fields
      if (!appointmentData.patient_id || !appointmentData.doctor_id || !appointmentData.appointment_date) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }
      
      const createdAppointment = await apiService.createAppointment(appointmentData)
      toast.success('Agendamento criado com sucesso!')
      onSave(createdAppointment)
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      
      let errorMessage = 'Erro ao criar agendamento'
      
      if (error.response?.data?.detail) {
        errorMessage += ': ' + error.response.data.detail
      } else if (error.message) {
        errorMessage += ': ' + error.message
      } else if (error.response?.data) {
        errorMessage += ': ' + JSON.stringify(error.response.data)
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const searchPatients = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const patients = await apiService.getPatients()
      const filtered = patients.filter((patient: any) => 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm)
      )
      setSearchResults(filtered.slice(0, 5)) // Limit to 5 results
    } catch (error) {
      console.error('Error searching patients:', error)
      toast.error('Erro ao buscar pacientes')
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({ 
      ...prev, 
      patientId: patient.id,
      patientName: patient.name,
      insurance: patient.insurance 
    }))
    setShowPatientSearch(false)
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          {initialData ? "Editar Agendamento" : "Novo Agendamento"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Paciente</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patientSearch">Buscar Paciente *</Label>
                <div className="flex gap-2">
                  <Input
                    id="patientSearch"
                    value={formData.patientName}
                    onChange={(e) => {
                      handleInputChange("patientName", e.target.value)
                      searchPatients(e.target.value)
                    }}
                    placeholder="Digite o nome ou CPF do paciente"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowPatientSearch(true)}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {(showPatientSearch || searchResults.length > 0) && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isSearching ? "Buscando..." : "Pacientes encontrados:"}
                  </p>
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((patient) => (
                        <div 
                          key={patient.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                          onClick={() => handlePatientSelect({
                            id: patient.id,
                            name: patient.full_name,
                            insurance: patient.insurance_company || "Não informado"
                          })}
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm">
                            {patient.full_name} - CPF: {patient.cpf}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Digite pelo menos 2 caracteres para buscar pacientes
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Detalhes do Agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor">Médico *</Label>
                <Select value={formData.doctorId} onValueChange={(value) => handleInputChange("doctorId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="appointmentType">Tipo de Consulta *</Label>
                <Select value={formData.appointmentType} onValueChange={(value) => handleInputChange("appointmentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Horário *</Label>
                <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
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
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações do Convênio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance">Convênio</Label>
                <Select value={formData.insurance} onValueChange={(value) => handleInputChange("insurance", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="sulamerica">SulAmérica</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="sus">SUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Observações</h3>
            <div>
              <Label htmlFor="notes">Observações do Agendamento</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Observações sobre o agendamento, sintomas, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="medical-button-primary"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Criando..." : (initialData ? "Atualizar Agendamento" : "Agendar Consulta")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
