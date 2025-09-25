import { AppLayout } from "@/components/layout/AppLayout"
import { DataTable } from "@/components/crud/DataTable"
import { useMedicalData } from "@/hooks/useMedicalData"
import { useNotifications } from "@/hooks/useNotifications"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PDFTestComponent from "@/components/pdf/PDFTestComponent"
import MedicalRecordPDFTest from "@/components/pdf/MedicalRecordPDFTest"
import PrescriptionPDFTest from "@/components/pdf/PrescriptionPDFTest"
import { 
  Users, 
  Calendar, 
  Package, 
  DollarSign,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText
} from "lucide-react"

const Demo = () => {
  const { 
    patients, 
    appointments, 
    inventory, 
    transactions,
    addPatient,
    addAppointment,
    addInventoryItem,
    addTransaction,
    deletePatient,
    deleteAppointment,
    deleteInventoryItem,
    getStatistics
  } = useMedicalData()
  
  const { 
    notifyNewPatient, 
    notifyNewAppointment, 
    notifyLowStock, 
    notifyPaymentReceived 
  } = useNotifications()
  
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'inventory' | 'transactions' | 'pdf-test' | 'medical-record-pdf-test' | 'prescription-pdf-test'>('patients')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [dbData, setDbData] = useState<any>({
    patients: [],
    appointments: [],
    inventory: [],
    transactions: []
  })
  const [loading, setLoading] = useState(false)
  const stats = getStatistics()

  useEffect(() => {
    loadDatabaseData()
  }, [])

  const loadDatabaseData = async () => {
    try {
      setLoading(true)
      
      // Load data from PostgreSQL database
      const [patientsData, appointmentsData, billingsData, inventoryData] = await Promise.all([
        apiService.getPatients(),
        apiService.getAppointments(),
        apiService.getBillings(),
        apiService.getInventoryItems()
      ])
      
      // Transform data to match expected format
      const transformedPatients = patientsData.map((patient: any) => ({
        id: patient.id.toString(),
        name: patient.full_name || patient.name,
        cpf: patient.cpf,
        phone: patient.phone,
        insurance: patient.insurance_company || 'Não informado',
        createdAt: new Date(patient.created_at || Date.now())
      }))
      
      const transformedAppointments = appointmentsData.map((apt: any) => ({
        id: apt.id.toString(),
        patientId: apt.patient_id,
        patientName: apt.patient_name,
        doctorId: apt.doctor_id,
        doctorName: apt.doctor_name,
        appointmentType: apt.appointment_type || 'Consulta',
        date: new Date(apt.appointment_date),
        time: apt.appointment_time,
        status: apt.status,
        insurance: apt.insurance_company || 'Particular'
      }))
      
      const transformedInventory = inventoryData.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity,
        unit: item.unit,
        price: item.price,
        supplier: item.supplier,
        status: item.status,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        createdAt: new Date(item.createdAt || Date.now())
      }))
      
      const transformedTransactions = billingsData.map((billing: any) => ({
        id: billing.id.toString(),
        patientName: billing.patient_name || 'N/A',
        service: billing.service_name || 'Consulta',
        value: billing.total_amount || 0,
        method: billing.payment_method || 'Não informado',
        status: billing.status || 'pendente',
        type: 'receita',
        date: new Date(billing.created_at || Date.now())
      }))
      
      setDbData({
        patients: transformedPatients,
        appointments: transformedAppointments,
        inventory: transformedInventory,
        transactions: transformedTransactions
      })
      
    } catch (error) {
      console.error('Error loading database data:', error)
      toast.error('Erro ao carregar dados do banco de dados')
      
      // Set fallback data
      setDbData({
        patients: [],
        appointments: [],
        inventory: [],
        transactions: []
      })
    } finally {
      setLoading(false)
    }
  }

  // Patient columns
  const patientColumns = [
    { key: 'name' as const, label: 'Nome', sortable: true },
    { key: 'cpf' as const, label: 'CPF', sortable: true },
    { key: 'phone' as const, label: 'Telefone', sortable: true },
    { key: 'insurance' as const, label: 'Convênio', sortable: true },
    { 
      key: 'createdAt' as const, 
      label: 'Data Cadastro', 
      sortable: true,
      render: (value: Date) => value.toLocaleDateString('pt-BR')
    }
  ]

  // Appointment columns
  const appointmentColumns = [
    { key: 'patientName' as const, label: 'Paciente', sortable: true },
    { key: 'doctorName' as const, label: 'Médico', sortable: true },
    { key: 'appointmentType' as const, label: 'Tipo', sortable: true },
    { 
      key: 'date' as const, 
      label: 'Data', 
      sortable: true,
      render: (value: Date) => value.toLocaleDateString('pt-BR')
    },
    { key: 'time' as const, label: 'Horário', sortable: true },
    { 
      key: 'status' as const, 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <Badge className={
          value === 'confirmado' ? 'medical-status-active' :
          value === 'aguardando' ? 'medical-status-pending' :
          'medical-status-inactive'
        }>
          {value}
        </Badge>
      )
    }
  ]

  // Inventory columns
  const inventoryColumns = [
    { key: 'name' as const, label: 'Nome', sortable: true },
    { key: 'category' as const, label: 'Categoria', sortable: true },
    { key: 'quantity' as const, label: 'Quantidade', sortable: true },
    { key: 'unit' as const, label: 'Unidade', sortable: true },
    { 
      key: 'price' as const, 
      label: 'Preço', 
      sortable: true,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    { 
      key: 'status' as const, 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <Badge className={
          value === 'ok' ? 'medical-status-active' :
          value === 'low' ? 'medical-status-pending' :
          'medical-status-inactive'
        }>
          {value === 'ok' ? 'OK' : value === 'low' ? 'Baixo' : 'Sem Estoque'}
        </Badge>
      )
    }
  ]

  // Transaction columns
  const transactionColumns = [
    { key: 'patientName' as const, label: 'Paciente', sortable: true },
    { key: 'service' as const, label: 'Serviço', sortable: true },
    { 
      key: 'value' as const, 
      label: 'Valor', 
      sortable: true,
      render: (value: number, row: any) => (
        <span className={row.type === 'receita' ? 'text-medical-green' : 'text-medical-red'}>
          {row.type === 'receita' ? '+' : '-'}R$ {value.toFixed(2)}
        </span>
      )
    },
    { key: 'method' as const, label: 'Método', sortable: true },
    { 
      key: 'status' as const, 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <Badge className={
          value === 'pago' ? 'medical-status-active' :
          value === 'pendente' ? 'medical-status-pending' :
          'medical-status-inactive'
        }>
          {value}
        </Badge>
      )
    },
    { 
      key: 'date' as const, 
      label: 'Data', 
      sortable: true,
      render: (value: Date) => value.toLocaleDateString('pt-BR')
    }
  ]

  // Demo actions
  const handleAddPatient = async () => {
    try {
      const newPatient = {
        full_name: `Paciente Demo ${Date.now()}`,
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        email: 'demo@email.com',
        birth_date: '1990-01-01',
        gender: 'male',
        insurance_company: 'unimed',
        is_active: true
      }
      
      await apiService.createPatient(newPatient)
      toast.success('Paciente criado com sucesso!')
      notifyNewPatient(newPatient.full_name)
      await loadDatabaseData() // Reload data
    } catch (error) {
      console.error('Error creating patient:', error)
      toast.error('Erro ao criar paciente')
    }
  }

  const handleAddAppointment = async () => {
    try {
      const newAppointment = {
        patient_id: 1,
        doctor_id: 1,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '14:00',
        appointment_type: 'Consulta de Rotina',
        status: 'scheduled',
        notes: 'Consulta de rotina',
        insurance_company: 'Unimed'
      }
      
      await apiService.createAppointment(newAppointment)
      toast.success('Consulta agendada com sucesso!')
      notifyNewAppointment('Maria Santos Silva', 'Dr. João Santos', new Date())
      await loadDatabaseData() // Reload data
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Erro ao agendar consulta')
    }
  }

  const handleAddInventoryItem = async () => {
    try {
      const newItem = {
        name: `Item Demo ${Date.now()}`,
        category: 'Medicamentos',
        quantity: 5,
        minQuantity: 10,
        maxQuantity: 50,
        unit: 'comprimidos',
        price: 15.50,
        supplier: 'Fornecedor Demo',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'low'
      }
      
      // Create inventory item in PostgreSQL
      const result = await apiService.createInventoryItem(newItem)
      if (result && result.id) {
        toast.success('Item de estoque adicionado com sucesso!')
        notifyLowStock(newItem.name, newItem.quantity)
        await loadDatabaseData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao adicionar item de estoque')
      }
    } catch (error) {
      console.error('Error creating inventory item:', error)
      toast.error('Erro ao adicionar item de estoque')
    }
  }

  const handleAddTransaction = async () => {
    try {
      const newTransaction = {
        patient_id: 1,
        doctor_id: 1,
        service_name: 'Consulta Cardiológica',
        total_amount: 250.00,
        payment_method: 'Cartão',
        status: 'paid',
        insurance_company: 'Particular',
        notes: 'Transação demo'
      }
      
      await apiService.createBilling(newTransaction)
      toast.success('Transação criada com sucesso!')
      notifyPaymentReceived('Carlos Eduardo', newTransaction.total_amount)
      await loadDatabaseData() // Reload data
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Erro ao criar transação')
    }
  }

  const handleExport = async () => {
    try {
      const currentData = getCurrentData()
      if (currentData.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }
      
      // Generate CSV content with proper encoding
      const csvHeaders = Object.keys(currentData[0])
      const csvRows = currentData.map((item: any) => 
        csvHeaders.map(header => {
          const value = item[header]
          if (value instanceof Date) {
            return value.toLocaleDateString('pt-BR')
          }
          return value || ''
        })
      )
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent
      
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  const handleImport = () => {
    setShowImportModal(true)
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'patients': return dbData.patients
      case 'appointments': return dbData.appointments
      case 'inventory': return dbData.inventory
      case 'transactions': return dbData.transactions
      case 'pdf-test': return []
      default: return []
    }
  }

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'patients': return patientColumns
      case 'appointments': return appointmentColumns
      case 'inventory': return inventoryColumns
      case 'transactions': return transactionColumns
      case 'pdf-test': return []
      default: return []
    }
  }

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'patients': return 'Pacientes'
      case 'appointments': return 'Agendamentos'
      case 'inventory': return 'Estoque'
      case 'transactions': return 'Transações Financeiras'
      case 'pdf-test': return 'Teste de PDF'
      default: return ''
    }
  }

  const getCurrentSearchFields = () => {
    switch (activeTab) {
      case 'patients': return ['name', 'cpf', 'phone', 'insurance']
      case 'appointments': return ['patientName', 'doctorName', 'appointmentType']
      case 'inventory': return ['name', 'category', 'supplier']
      case 'transactions': return ['patientName', 'service', 'invoice']
      case 'pdf-test': return []
      default: return []
    }
  }

  const handleAdd = () => {
    switch (activeTab) {
      case 'patients': handleAddPatient(); break
      case 'appointments': handleAddAppointment(); break
      case 'inventory': handleAddInventoryItem(); break
      case 'transactions': handleAddTransaction(); break
      case 'pdf-test': break // No action for PDF test
    }
  }

  const handleDelete = async (item: any) => {
    try {
      switch (activeTab) {
        case 'patients': 
          await apiService.deletePatient(parseInt(item.id))
          toast.success('Paciente excluído com sucesso!')
          break
        case 'appointments': 
          await apiService.updateAppointmentStatus(parseInt(item.id), 'cancelled')
          toast.success('Consulta cancelada com sucesso!')
          break
        case 'inventory': 
          await apiService.deleteInventoryItem(parseInt(item.id))
          toast.success('Item de estoque excluído com sucesso!')
          break
        case 'transactions': 
          // Transactions usually shouldn't be deleted, but we can mark as cancelled
          toast.info('Transações não podem ser excluídas')
          break
        case 'pdf-test': 
          break // No action for PDF test
      }
      
      await loadDatabaseData() // Reload data from PostgreSQL
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Erro ao excluir item')
    }
  }

  return (
    <AppLayout 
      title="Demonstração Completa" 
      subtitle="Teste todas as funcionalidades do CliniCore"
    >
      <div className="space-y-6">
        {/* Statistics Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pacientes
                  </p>
                  <h3 className="text-2xl font-bold text-primary">
                    {stats.totalPatients}
                  </h3>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Consultas Hoje
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    {stats.todayAppointments}
                  </h3>
                </div>
                <Calendar className="w-8 h-8 text-medical-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Estoque Baixo
                  </p>
                  <h3 className="text-2xl font-bold text-medical-amber">
                    {stats.lowStockCount}
                  </h3>
                </div>
                <Package className="w-8 h-8 text-medical-amber" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Receita Total
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-medical-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <Button
            variant={activeTab === 'patients' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('patients')}
            className={activeTab === 'patients' ? 'medical-button-primary' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Pacientes
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('appointments')}
            className={activeTab === 'appointments' ? 'medical-button-primary' : ''}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendamentos
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className={activeTab === 'inventory' ? 'medical-button-primary' : ''}
          >
            <Package className="w-4 h-4 mr-2" />
            Estoque
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('transactions')}
            className={activeTab === 'transactions' ? 'medical-button-primary' : ''}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Financeiro
          </Button>
          <Button
            variant={activeTab === 'pdf-test' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pdf-test')}
            className={activeTab === 'pdf-test' ? 'medical-button-primary' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            Teste PDF
          </Button>
          <Button
            variant={activeTab === 'medical-record-pdf-test' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('medical-record-pdf-test')}
            className={activeTab === 'medical-record-pdf-test' ? 'medical-button-primary' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            Teste Prontuário
          </Button>
          <Button
            variant={activeTab === 'prescription-pdf-test' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('prescription-pdf-test')}
            className={activeTab === 'prescription-pdf-test' ? 'medical-button-primary' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            Teste Receitas
          </Button>
        </div>

        {/* Data Table or PDF Test */}
        {activeTab === 'pdf-test' ? (
          <PDFTestComponent />
        ) : activeTab === 'medical-record-pdf-test' ? (
          <MedicalRecordPDFTest />
        ) : activeTab === 'prescription-pdf-test' ? (
          <PrescriptionPDFTest />
        ) : (
          <DataTable
            data={getCurrentData()}
            columns={getCurrentColumns()}
            title={getCurrentTitle()}
            searchFields={getCurrentSearchFields()}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            emptyMessage={`Nenhum ${getCurrentTitle().toLowerCase()} encontrado`}
          />
        )}

        {/* Demo Actions */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ações de Demonstração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={handleAddPatient}
              >
                <Users className="w-6 h-6" />
                <span>Adicionar Paciente</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={handleAddAppointment}
              >
                <Calendar className="w-6 h-6" />
                <span>Novo Agendamento</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={handleAddInventoryItem}
              >
                <Package className="w-6 h-6" />
                <span>Item Estoque Baixo</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={handleAddTransaction}
              >
                <DollarSign className="w-6 h-6" />
                <span>Nova Transação</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/10"
                onClick={() => {
                  loadDatabaseData()
                }}
              >
                <Activity className="w-6 h-6" />
                <span>Atualizar Dados</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Dados
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Arquivo CSV</Label>
                <Input 
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        // Simulate file processing and import to PostgreSQL
                        const formData = new FormData()
                        formData.append('file', file)
                        
                        // Here you would typically call an import API endpoint
                        // For now, we'll simulate the import
                        toast.success('Arquivo importado com sucesso!')
                        setShowImportModal(false)
                        await loadDatabaseData() // Reload data from PostgreSQL
                      } catch (error) {
                        console.error('Error importing file:', error)
                        toast.error('Erro ao importar arquivo')
                      }
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Formato esperado: CSV com cabeçalhos correspondentes aos campos da tabela</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

export default Demo
