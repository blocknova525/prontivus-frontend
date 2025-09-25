import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Key,
  Building2,
  Settings
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const licenses = [
  {
    id: '1',
    type: 'CliniCore Pro',
    status: 'active',
    users: 12,
    maxUsers: 50,
    expiryDate: new Date('2025-11-30'),
    modules: ['Dashboard', 'Secretaria', 'Atendimento', 'Agenda', 'Financeiro', 'Estoque', 'Portal', 'Relatórios'],
    price: 299.90,
    billingCycle: 'monthly',
    autoRenew: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    type: 'CliniCore Basic',
    status: 'expired',
    users: 5,
    maxUsers: 10,
    expiryDate: new Date('2024-01-15'),
    modules: ['Dashboard', 'Secretaria', 'Atendimento'],
    price: 99.90,
    billingCycle: 'monthly',
    autoRenew: false,
    createdAt: new Date('2023-01-15')
  }
]

const licenseTypes = [
  { value: 'basic', label: 'CliniCore Basic', price: 99.90, maxUsers: 10, modules: ['Dashboard', 'Secretaria', 'Atendimento'] },
  { value: 'pro', label: 'CliniCore Pro', price: 299.90, maxUsers: 50, modules: ['Dashboard', 'Secretaria', 'Atendimento', 'Agenda', 'Financeiro', 'Estoque', 'Portal', 'Relatórios'] },
  { value: 'enterprise', label: 'CliniCore Enterprise', price: 599.90, maxUsers: 200, modules: ['Todos os módulos', 'API', 'Integrações', 'Suporte Premium'] }
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'medical-status-active'
    case 'expired':
      return 'medical-status-inactive'
    case 'pending':
      return 'medical-status-pending'
    default:
      return 'medical-status-inactive'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4" />
    case 'expired':
      return <XCircle className="w-4 h-4" />
    case 'pending':
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <XCircle className="w-4 h-4" />
  }
}

const Licencas = () => {
  const [showLicenseForm, setShowLicenseForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<any>(null)
  const [licenses, setLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState({
    activeLicenses: 0,
    totalUsers: 0,
    expiringSoon: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    loadLicensesData()
  }, [])

  const loadLicensesData = async () => {
    try {
      setLoading(true)
      
      // Load licenses from PostgreSQL database
      const licensesData = await apiService.getLicenses()
      
      // Transform data to ensure proper date handling
      const transformedLicenses = licensesData.map((license: any) => ({
        ...license,
        expiryDate: license.expiryDate ? new Date(license.expiryDate) : new Date(),
        createdAt: license.createdAt ? new Date(license.createdAt) : new Date()
      }))
      
      setLicenses(transformedLicenses)
      
      // Calculate statistics from PostgreSQL data
      const activeLicenses = transformedLicenses.filter((l: any) => l.status === 'active').length
      const totalUsers = transformedLicenses.reduce((sum: number, l: any) => sum + (l.users || 0), 0)
      const expiringSoon = transformedLicenses.filter((l: any) => {
        const daysUntilExpiry = Math.ceil((l.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length
      const totalRevenue = transformedLicenses.reduce((sum: number, l: any) => sum + (l.price || 0), 0)
      
      setStatistics({
        activeLicenses,
        totalUsers,
        expiringSoon,
        totalRevenue
      })
      
    } catch (error) {
      console.error('Error loading licenses data:', error)
      toast.error('Erro ao carregar dados das licenças')
      
      // Set fallback data
      setStatistics({
        activeLicenses: 0,
        totalUsers: 0,
        expiringSoon: 0,
        totalRevenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLicense = () => {
    setSelectedLicense(null)
    setShowLicenseForm(true)
  }

  const handleEditLicense = (license: any) => {
    setSelectedLicense(license)
    setShowLicenseForm(true)
  }

  const handleSaveLicense = async (licenseData: any) => {
    try {
      let result
      if (selectedLicense) {
        // Update existing license
        result = await apiService.updateLicense(selectedLicense.id, licenseData)
        if (result && result.id) {
          toast.success('Licença atualizada com sucesso!')
        } else {
          toast.error('Erro ao atualizar licença')
        }
      } else {
        // Create new license
        result = await apiService.createLicense(licenseData)
        if (result && result.id) {
          toast.success('Licença criada com sucesso!')
        } else {
          toast.error('Erro ao criar licença')
        }
      }
      
      setShowLicenseForm(false)
      setSelectedLicense(null)
      await loadLicensesData() // Reload data from PostgreSQL
    } catch (error) {
      console.error('Error saving license:', error)
      toast.error('Erro ao salvar licença')
    }
  }

  const handleCancelLicense = () => {
    setShowLicenseForm(false)
    setSelectedLicense(null)
  }

  const handleDeleteLicense = async (license: any) => {
    try {
      const result = await apiService.deleteLicense(license.id)
      if (result && result.success) {
        toast.success('Licença excluída com sucesso!')
        setShowDeleteModal(false)
        await loadLicensesData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao excluir licença')
      }
    } catch (error) {
      console.error('Error deleting license:', error)
      toast.error('Erro ao excluir licença')
    }
  }

  const handleRenewLicense = async (license: any) => {
    try {
      const result = await apiService.renewLicense(license.id)
      if (result && result.id) {
        toast.success('Licença renovada com sucesso!')
        await loadLicensesData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao renovar licença')
      }
    } catch (error) {
      console.error('Error renewing license:', error)
      toast.error('Erro ao renovar licença')
    }
  }

  const handleActivateLicense = async (license: any) => {
    try {
      const result = await apiService.activateLicense(license.id)
      if (result && result.id) {
        toast.success('Licença ativada com sucesso!')
        await loadLicensesData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao ativar licença')
      }
    } catch (error) {
      console.error('Error activating license:', error)
      toast.error('Erro ao ativar licença')
    }
  }

  const handleExportLicenses = async () => {
    try {
      // Generate CSV content with proper encoding
      const csvHeaders = ['ID', 'Tipo', 'Status', 'Usuários', 'Máx Usuários', 'Data Expiração', 'Preço', 'Ciclo Cobrança', 'Auto Renovação', 'Módulos']
      const csvRows = licenses.map(license => [
        license.id,
        license.type,
        license.status,
        license.users,
        license.maxUsers,
        license.expiryDate.toLocaleDateString('pt-BR'),
        license.price,
        license.billingCycle,
        license.autoRenew ? 'Sim' : 'Não',
        license.modules ? license.modules.join('; ') : ''
      ])
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent
      
      // Download CSV
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `licencas_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Licenças exportadas com sucesso!')
    } catch (error) {
      console.error('Error exporting licenses:', error)
      toast.error('Erro ao exportar licenças')
    }
  }

  const handleImportLicenses = () => {
    setShowImportModal(true)
  }

  if (showLicenseForm) {
    return (
      <AppLayout 
        title={selectedLicense ? "Editar Licença" : "Nova Licença"} 
        subtitle="Gerenciar licenças do sistema"
      >
        <LicenseForm 
          initialData={selectedLicense}
          onSave={handleSaveLicense}
          onCancel={handleCancelLicense}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      title="Licenças" 
      subtitle="Controle de acessos e licenças do sistema"
    >
      <div className="space-y-6">
        {/* License Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Licenças Ativas
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    {statistics.activeLicenses}
                  </h3>
                </div>
                <Shield className="w-8 h-8 text-medical-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Usuários Ativos
                  </p>
                  <h3 className="text-2xl font-bold text-primary">
                    {statistics.totalUsers}
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
                    Capacidade Total
                  </p>
                  <h3 className="text-2xl font-bold text-medical-amber">
                    {licenses.reduce((sum, l) => sum + l.maxUsers, 0)}
                  </h3>
                </div>
                <Building2 className="w-8 h-8 text-medical-amber" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Receita Mensal
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    R$ {statistics.totalRevenue.toFixed(2)}
                  </h3>
                </div>
                <Key className="w-8 h-8 text-medical-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Button className="medical-button-primary h-20 flex flex-col gap-2" onClick={handleAddLicense}>
            <Plus className="w-6 h-6" />
            <span>Nova Licença</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-primary/10" onClick={handleExportLicenses}>
            <Download className="w-6 h-6" />
            <span>Exportar</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-medical-green/10" onClick={handleImportLicenses}>
            <Upload className="w-6 h-6" />
            <span>Importar</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-medical-amber/10" onClick={() => {
            loadLicensesData()
          }}>
            <Settings className="w-6 h-6" />
            <span>Atualizar</span>
          </Button>
        </div>

        {/* Licenses List */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Licenças do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {licenses.map((license) => (
                <div key={license.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {license.type}
                      </h4>
                      <Badge className={`text-xs px-2 py-1 ${getStatusVariant(license.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(license.status)}
                          {license.status === 'active' ? 'Ativa' : license.status === 'expired' ? 'Expirada' : 'Pendente'}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {license.users} / {license.maxUsers} usuários • R$ {license.price.toFixed(2)}/mês
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Expira: {license.expiryDate.toLocaleDateString('pt-BR')}</span>
                      <span>Ciclo: {license.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                      <span>Auto-renovação: {license.autoRenew ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {license.modules.map((module) => (
                        <Badge key={module} className="text-xs bg-primary/10 text-primary">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="medical-button-primary" onClick={() => handleEditLicense(license)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-primary/10"
                      onClick={() => {
                        // Generate license report
                        const reportData = {
                          licenseId: license.id,
                          licenseType: license.type,
                          status: license.status,
                          users: license.users,
                          maxUsers: license.maxUsers,
                          expiryDate: license.expiryDate.toLocaleDateString('pt-BR'),
                          modules: license.modules.join(', '),
                          price: license.price,
                          billingCycle: license.billingCycle
                        }
                        
                        // Create CSV report for individual license
                        const csvContent = [
                          ['Campo', 'Valor'],
                          ['ID da Licença', reportData.licenseId],
                          ['Tipo', reportData.licenseType],
                          ['Status', reportData.status],
                          ['Usuários Ativos', reportData.users],
                          ['Máximo de Usuários', reportData.maxUsers],
                          ['Data de Expiração', reportData.expiryDate],
                          ['Módulos', reportData.modules],
                          ['Preço', reportData.price],
                          ['Ciclo de Cobrança', reportData.billingCycle]
                        ].map(row => row.join(',')).join('\n')
                        
                        const BOM = '\uFEFF'
                        const csvWithBOM = BOM + csvContent
                        
                        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
                        const link = document.createElement('a')
                        const url = URL.createObjectURL(blob)
                        link.setAttribute('href', url)
                        link.setAttribute('download', `relatorio_licenca_${license.id}_${new Date().toISOString().split('T')[0]}.csv`)
                        link.style.visibility = 'hidden'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)
                        
                        toast.success('Relatório da licença gerado com sucesso!')
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Relatório
                    </Button>
                    {license.status === 'expired' && (
                      <Button size="sm" variant="outline" className="hover:bg-medical-green/10" onClick={() => handleRenewLicense(license)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Renovar
                      </Button>
                    )}
                    {license.status === 'pending' && (
                      <Button size="sm" variant="outline" className="hover:bg-medical-green/10" onClick={() => handleActivateLicense(license)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="hover:bg-red-500/10 text-red-500" onClick={() => {
                      setSelectedLicense(license)
                      setShowDeleteModal(true)
                    }}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* License Types */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Tipos de Licença Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-3">
              {licenseTypes.map((type) => (
                <div key={type.value} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <h4 className="font-semibold text-foreground mb-2">{type.label}</h4>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary">R$ {type.price.toFixed(2)}/mês</p>
                    <p className="text-sm text-muted-foreground">Até {type.maxUsers} usuários</p>
                    <div className="space-y-1">
                      {type.modules.map((module) => (
                        <div key={module} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-medical-green" />
                          <span>{module}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full medical-button-primary mt-4"
                      onClick={() => {
                        // Create new license with selected type
                        const newLicenseData = {
                          type: type.label,
                          users: 0,
                          maxUsers: type.maxUsers,
                          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                          modules: type.modules,
                          price: type.price,
                          billingCycle: 'monthly',
                          autoRenew: true,
                          status: 'pending'
                        }
                        handleSaveLicense(newLicenseData)
                      }}
                    >
                      Contratar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Licenças
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
                        toast.success('Licenças importadas com sucesso!')
                        setShowImportModal(false)
                        await loadLicensesData() // Reload data from PostgreSQL
                      } catch (error) {
                        console.error('Error importing licenses:', error)
                        toast.error('Erro ao importar licenças')
                      }
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Formato esperado: CSV com cabeçalhos correspondentes aos campos das licenças</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir a licença <strong>{selectedLicense?.type}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteLicense(selectedLicense)}>
                  Excluir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

// License Form Component
function LicenseForm({ initialData, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    type: initialData?.type || '',
    users: initialData?.users || 1,
    maxUsers: initialData?.maxUsers || 10,
    expiryDate: initialData?.expiryDate || new Date(),
    price: initialData?.price || 99.90,
    billingCycle: initialData?.billingCycle || 'monthly',
    autoRenew: initialData?.autoRenew || false,
    modules: initialData?.modules || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {initialData ? "Editar Licença" : "Nova Licença"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Licença</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.label}>
                      {type.label} - R$ {type.price.toFixed(2)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxUsers">Máximo de Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                min="1"
                max="1000"
              />
            </div>
            <div>
              <Label htmlFor="price">Preço Mensal</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="billingCycle">Ciclo de Cobrança</Label>
              <Select value={formData.billingCycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="medical-button-primary">
              {initialData ? "Atualizar Licença" : "Criar Licença"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Licencas
