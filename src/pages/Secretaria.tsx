import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PatientForm } from "@/components/forms/PatientForm"
import { 
  Search, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  Camera,
  RefreshCw,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import DocumentsModal from "@/components/modals/DocumentsModal"

// Mock data as fallback
const mockWaitingPatients = [
  {
    appointment_id: 1,
    patient_id: 1,
    patient_name: "Maria Santos Silva",
    appointment_time: "09:30",
    status: "scheduled",
    insurance_company: "Unimed",
    phone: "(11) 99999-9999",
    waiting_status: "aguardando",
    check_in_time: "09:25",
    doctor_name: "Dr. João Silva"
  },
  {
    appointment_id: 2,
    patient_id: 2,
    patient_name: "João Carlos Pereira",
    appointment_time: "10:00",
    status: "confirmed",
    insurance_company: "Bradesco Saúde",
    phone: "(11) 88888-8888",
    waiting_status: "chamado",
    check_in_time: "09:55",
    doctor_name: "Dra. Maria Santos"
  }
]

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "urgente":
      return "medical-status-inactive"
    case "normal":
      return "medical-status-active"
    default:
      return "medical-status-pending"
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "chamado":
      return "medical-status-pending"
    case "aguardando":
      return "medical-status-active"
    case "atendimento":
      return "bg-blue-50 text-blue-700 border border-blue-200"
    default:
      return "medical-status-inactive"
  }
}

const Secretaria = () => {
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [waitingPatients, setWaitingPatients] = useState(mockWaitingPatients)
  const [dailyStats, setDailyStats] = useState({
    total_appointments: 18,
    completed: 15,
    cancelled: 2,
    no_show: 1,
    waiting: 3,
    occupancy_rate: 83.3,
    average_wait_time: "12 min"
  })
  const [insuranceStatus, setInsuranceStatus] = useState([
    { name: "Unimed", status: "online" },
    { name: "Bradesco Saúde", status: "online" },
    { name: "SulAmérica", status: "slow" },
    { name: "Amil", status: "offline" }
  ])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    loadSecretaryData()
  }, [])

  const loadSecretaryData = async () => {
    try {
      setLoading(true)
      
      // Load waiting panel data from PostgreSQL
      const waitingData = await apiService.getWaitingPanel()
      if (waitingData && Array.isArray(waitingData)) {
        setWaitingPatients(waitingData)
      } else {
        setWaitingPatients(mockWaitingPatients)
      }
      
      // Load daily stats from PostgreSQL
      const statsData = await apiService.getDailyStats()
      if (statsData && typeof statsData === 'object') {
        setDailyStats(statsData)
      } else {
        setDailyStats(dailyStats)
      }
      
      // Load insurance status from PostgreSQL
      const insuranceData = await apiService.getInsuranceStatus()
      if (insuranceData && Array.isArray(insuranceData)) {
        setInsuranceStatus(insuranceData)
      } else {
        setInsuranceStatus(insuranceStatus)
      }
      
    } catch (error) {
      console.error('Error loading secretary data:', error)
      toast.error('Erro ao carregar dados da secretaria')
      // Use fallback data
      setWaitingPatients(mockWaitingPatients)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSave = (patient: any) => {
    console.log("Paciente salvo:", patient)
    setShowPatientForm(false)
    toast.success('Paciente cadastrado com sucesso!')
    loadSecretaryData() // Reload data
  }

  const handlePatientCancel = () => {
    setShowPatientForm(false)
  }

  const handleCheckIn = async (appointmentId: number, patientId: number) => {
    try {
      const result = await apiService.checkInPatient({
        appointment_id: appointmentId,
        patient_id: patientId
      })
      
      if (result && result.message) {
        toast.success('Check-in realizado com sucesso!')
        // Update the local state to show check-in time
        setWaitingPatients(prev => prev.map(patient => 
          patient.appointment_id === appointmentId 
            ? { ...patient, check_in_time: result.check_in_time, status: 'confirmed' }
            : patient
        ))
      } else {
        toast.success('Check-in realizado com sucesso!')
        loadSecretaryData() // Reload data
      }
    } catch (error) {
      console.error('Error checking in patient:', error)
      toast.error('Erro ao realizar check-in')
    }
  }

  const handleCallPatient = async (appointmentId: number) => {
    try {
      const result = await apiService.updateAppointmentStatus(appointmentId, 'in_progress')
      
      if (result && result.message) {
        toast.success('Paciente chamado!')
        // Update the local state to show patient was called
        setWaitingPatients(prev => prev.map(patient => 
          patient.appointment_id === appointmentId 
            ? { ...patient, waiting_status: 'chamado', status: 'in_progress' }
            : patient
        ))
      } else {
        toast.success('Paciente chamado!')
        loadSecretaryData() // Reload data
      }
    } catch (error) {
      console.error('Error calling patient:', error)
      toast.error('Erro ao chamar paciente')
    }
  }

  const handlePatientSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    
    try {
      setSearchLoading(true)
      const results = await apiService.searchPatients(query)
      if (results && Array.isArray(results)) {
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching patients:', error)
      toast.error('Erro ao buscar pacientes')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const openPatientSearchModal = () => {
    setShowPatientSearchModal(true)
    setSearchResults([])
  }

  const filteredPatients = waitingPatients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.insurance_company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showPatientForm) {
    return (
      <AppLayout 
        title="Novo Paciente" 
        subtitle="Cadastro de novo paciente"
      >
        <PatientForm 
          onSave={handlePatientSave}
          onCancel={handlePatientCancel}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      title="Secretaria" 
      subtitle="Gestão de check-in e atendimento de pacientes"
    >
      <div className="space-y-6">
        {/* Quick Actions for Reception */}
        <div className="grid gap-4 md:grid-cols-6">
          <Button 
            className="medical-button-primary h-20 flex flex-col gap-2"
            onClick={() => setShowPatientForm(true)}
          >
            <UserPlus className="w-6 h-6" />
            <span>Novo Paciente</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-primary/10"
            onClick={openPatientSearchModal}
          >
            <Search className="w-6 h-6" />
            <span>Buscar Paciente</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-green-500/10"
            onClick={loadSecretaryData}
            disabled={loading}
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-medical-amber/10"
            onClick={() => setShowDocumentsModal(true)}
          >
            <FileText className="w-6 h-6" />
            <span>Documentos</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-blue-500/10"
            onClick={() => {
              // Navigate to agenda page
              window.location.href = '/agenda';
            }}
          >
            <Calendar className="w-6 h-6" />
            <span>Agenda</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-purple-500/10"
            onClick={() => {
              // Navigate to reports page
              window.location.href = '/relatorios';
            }}
          >
            <TrendingUp className="w-6 h-6" />
            <span>Relatórios</span>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Queue - Takes 2/3 of space */}
          <div className="lg:col-span-2">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Fila de Atendimento
                  </div>
                  <Badge className="medical-status-active">
                    {filteredPatients.length} pacientes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Carregando pacientes...</span>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum paciente encontrado</p>
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setSearchTerm("")}
                      >
                        Limpar filtro
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div key={patient.appointment_id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {patient.patient_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {patient.patient_name || patient.full_name}
                          </h4>
                          <Badge className={`text-xs ${getStatusVariant(patient.waiting_status || 'aguardando')}`}>
                            {patient.waiting_status || 'aguardando'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {patient.status || 'scheduled'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Agendado: {patient.appointment_time}</span>
                          </div>
                          {patient.check_in_time && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Check-in: {patient.check_in_time}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{patient.insurance_company || 'Convênio não informado'}</span>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{patient.phone || 'Telefone não informado'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{patient.doctor_name || 'Dr. Não Informado'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          className="medical-button-primary"
                          onClick={() => handleCallPatient(patient.appointment_id)}
                        >
                          Chamar
                        </Button>
                        {!patient.check_in_time && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleCheckIn(patient.appointment_id, patient.patient_id)}
                          >
                            Check-in
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Patient Search */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Busca Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, CPF ou telefone..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full medical-button-primary"
                  onClick={() => {
                    if (searchTerm) {
                      handlePatientSearch(searchTerm);
                      toast.info(`Buscando por: ${searchTerm}`);
                    } else {
                      toast.info('Digite um termo para buscar');
                    }
                  }}
                >
                  Buscar Paciente
                </Button>
              </CardContent>
            </Card>

            {/* Convenios Status */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Status Convênios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insuranceStatus.map((insurance) => (
                  <div key={insurance.name} className="flex items-center justify-between">
                    <span className="text-sm">{insurance.name}</span>
                    <Badge className={
                      insurance.status === 'online' ? 'medical-status-active' :
                      insurance.status === 'slow' ? 'medical-status-pending' :
                      'medical-status-inactive'
                    }>
                      {insurance.status === 'online' ? 'Online' :
                       insurance.status === 'slow' ? 'Lento' :
                       'Offline'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Estatísticas do Dia</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={loadSecretaryData}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total agendamentos:</span>
                  <span className="font-medium">{dailyStats.total_appointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Consultas finalizadas:</span>
                  <span className="font-medium">{dailyStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Canceladas:</span>
                  <span className="font-medium text-red-600">{dailyStats.cancelled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Aguardando:</span>
                  <span className="font-medium text-blue-600">{dailyStats.waiting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa ocupação:</span>
                  <span className="font-medium text-green-600">{dailyStats.occupancy_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tempo médio espera:</span>
                  <span className="font-medium">{dailyStats.average_wait_time}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents Modal */}
        <DocumentsModal
          isOpen={showDocumentsModal}
          onClose={() => setShowDocumentsModal(false)}
        />

        {/* Patient Search Modal */}
        <Dialog open={showPatientSearchModal} onOpenChange={setShowPatientSearchModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buscar Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Digite nome, CPF, telefone ou email..."
                  className="pl-10"
                  onChange={(e) => {
                    const query = e.target.value
                    if (query.length >= 2) {
                      handlePatientSearch(query)
                    } else {
                      setSearchResults([])
                    }
                  }}
                />
              </div>
              
              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Buscando...</span>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <div key={patient.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {patient.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {patient.full_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {patient.appointment_count} consultas
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>CPF: {patient.cpf}</span>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{patient.phone}</span>
                          </div>
                          {patient.insurance_company && (
                            <span>{patient.insurance_company}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="medical-button-primary"
                        onClick={() => {
                          toast.success(`Paciente ${patient.full_name} selecionado`);
                          setShowPatientSearchModal(false);
                          // You could add additional logic here to navigate to patient details
                          // or perform other actions with the selected patient
                        }}
                      >
                        Selecionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.length === 0 && !searchLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Digite pelo menos 2 caracteres para buscar pacientes</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Secretaria;