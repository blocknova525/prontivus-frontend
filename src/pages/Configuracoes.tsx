import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Bell, 
  Shield,
  Database,
  Cloud,
  Mail,
  Phone,
  Globe,
  Users,
  Calendar,
  FileText,
  Download,
  Upload,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'integrations' | 'backup'>('general')
  const [settings, setSettings] = useState({
    // General Settings
    clinicName: 'CliniCore Medical Center',
    clinicLogo: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'BRL',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    paymentAlerts: true,
    systemAlerts: true,
    lowStockAlerts: true,
    
    // Security Settings
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    twoFactorAuth: false,
    ipWhitelist: '',
    auditLog: true,
    
    // Integration Settings
    tissIntegration: true,
    labIntegration: false,
    pharmacyIntegration: false,
    imagingIntegration: false,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    cloudBackup: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null as Date | null,
    nextBackup: null as Date | null,
    backupSize: '0 MB',
    integrityStatus: 'unknown' as 'unknown' | 'valid' | 'invalid'
  })

  useEffect(() => {
    loadSettingsData()
  }, [])

  const loadSettingsData = async () => {
    try {
      setLoading(true)
      
      // Load settings from PostgreSQL database
      const settingsData = await apiService.getSettings()
      setSettings(settingsData)
      
      // Load backup status from PostgreSQL
      const backupStatusData = await apiService.getBackupStatus()
      
      // Transform backup status data
      setBackupStatus({
        lastBackup: backupStatusData.lastBackup ? new Date(backupStatusData.lastBackup) : null,
        nextBackup: backupStatusData.nextBackup ? new Date(backupStatusData.nextBackup) : null,
        backupSize: backupStatusData.backupSize || '0 MB',
        integrityStatus: backupStatusData.integrityStatus || 'unknown'
      })
      
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Erro ao carregar configurações')
      
      // Set fallback data
      setBackupStatus({
        lastBackup: null,
        nextBackup: null,
        backupSize: '0 MB',
        integrityStatus: 'unknown'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Save settings to PostgreSQL database
      const result = await apiService.updateSettings(settings)
      if (result && result.updatedAt) {
        toast.success('Configurações salvas com sucesso!')
        await loadSettingsData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualBackup = async () => {
    try {
      setLoading(true)
      // Create manual backup in PostgreSQL
      const result = await apiService.createManualBackup()
      if (result && result.success) {
        toast.success('Backup manual realizado com sucesso!')
        await loadSettingsData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao realizar backup manual')
      }
    } catch (error) {
      console.error('Error creating manual backup:', error)
      toast.error('Erro ao realizar backup manual')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreBackup = () => {
    setShowRestoreModal(true)
  }

  const handleCheckIntegrity = async () => {
    try {
      setLoading(true)
      // Check backup integrity in PostgreSQL
      const result = await apiService.checkBackupIntegrity()
      if (result && result.success) {
        setBackupStatus(prev => ({
          ...prev,
          integrityStatus: result.integrityStatus || 'valid'
        }))
        toast.success('Verificação de integridade concluída! Backup válido.')
        await loadSettingsData() // Reload data from PostgreSQL
      } else {
        setBackupStatus(prev => ({
          ...prev,
          integrityStatus: 'invalid'
        }))
        toast.error('Erro na verificação de integridade')
      }
    } catch (error) {
      console.error('Error checking integrity:', error)
      setBackupStatus(prev => ({
        ...prev,
        integrityStatus: 'invalid'
      }))
      toast.error('Erro na verificação de integridade')
    } finally {
      setLoading(false)
    }
  }

  const handleExportSettings = async () => {
    try {
      // Export settings from PostgreSQL
      const settingsData = await apiService.exportSettings()
      const settingsJson = JSON.stringify(settingsData, null, 2)
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF'
      const jsonWithBOM = BOM + settingsJson
      
      const blob = new Blob([jsonWithBOM], { type: 'application/json;charset=utf-8' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `configuracoes_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Configurações exportadas com sucesso!')
    } catch (error) {
      console.error('Error exporting settings:', error)
      toast.error('Erro ao exportar configurações')
    }
  }

  const handleImportSettings = () => {
    setShowImportModal(true)
  }

  const handleResetSettings = async () => {
    try {
      // Reset settings in PostgreSQL
      const result = await apiService.resetSettings()
      if (result && result.success) {
        toast.success('Configurações resetadas para valores padrão!')
        await loadSettingsData() // Reload data from PostgreSQL
      } else {
        toast.error('Erro ao resetar configurações')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('Erro ao resetar configurações')
    }
  }

  const handleTestIntegrations = async () => {
    try {
      setLoading(true)
      // Test integrations in PostgreSQL
      const results = await apiService.testIntegrations()
      
      if (results) {
        toast.success('Teste de integrações concluído!')
        console.log('Integration test results:', results)
        
        // Show detailed results
        const statusMessages = Object.entries(results).map(([key, result]: [string, any]) => 
          `${key.toUpperCase()}: ${result.status} - ${result.message}`
        ).join('\n')
        
        toast.info(`Resultados dos testes:\n${statusMessages}`)
      } else {
        toast.error('Erro ao testar integrações')
      }
    } catch (error) {
      console.error('Error testing integrations:', error)
      toast.error('Erro ao testar integrações')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'integrations', label: 'Integrações', icon: Cloud },
    { id: 'backup', label: 'Backup', icon: Database }
  ]

  return (
    <AppLayout 
      title="Configurações" 
      subtitle="Configurações do sistema"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'medical-button-primary' : ''}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinicName">Nome da Clínica</Label>
                    <Input
                      id="clinicName"
                      value={settings.clinicName}
                      onChange={(e) => handleSettingChange('clinicName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                        <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Formato de Data</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeFormat">Formato de Hora</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 horas</SelectItem>
                        <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Configurações de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">Notificações por SMS</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações por SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações push no navegador</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointmentReminders">Lembretes de Consulta</Label>
                      <p className="text-sm text-muted-foreground">Enviar lembretes de consultas</p>
                    </div>
                    <Switch
                      id="appointmentReminders"
                      checked={settings.appointmentReminders}
                      onCheckedChange={(checked) => handleSettingChange('appointmentReminders', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentAlerts">Alertas de Pagamento</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre pagamentos recebidos</p>
                    </div>
                    <Switch
                      id="paymentAlerts"
                      checked={settings.paymentAlerts}
                      onCheckedChange={(checked) => handleSettingChange('paymentAlerts', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowStockAlerts">Alertas de Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">Notificar quando estoque estiver baixo</p>
                    </div>
                    <Switch
                      id="lowStockAlerts"
                      checked={settings.lowStockAlerts}
                      onCheckedChange={(checked) => handleSettingChange('lowStockAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">Requerer código adicional para login</p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="passwordPolicy">Política de Senhas</Label>
                    <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básica (6 caracteres)</SelectItem>
                        <SelectItem value="medium">Média (8 caracteres, números)</SelectItem>
                        <SelectItem value="strong">Forte (12 caracteres, números, símbolos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="ipWhitelist">Lista de IPs Permitidos</Label>
                    <Textarea
                      id="ipWhitelist"
                      value={settings.ipWhitelist}
                      onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                      placeholder="192.168.1.1&#10;10.0.0.1"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Um IP por linha. Deixe vazio para permitir todos.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auditLog">Log de Auditoria</Label>
                      <p className="text-sm text-muted-foreground">Registrar todas as ações do sistema</p>
                    </div>
                    <Switch
                      id="auditLog"
                      checked={settings.auditLog}
                      onCheckedChange={(checked) => handleSettingChange('auditLog', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-primary" />
                  Integrações Externas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tissIntegration">Integração TISS</Label>
                      <p className="text-sm text-muted-foreground">Conectar com sistemas de convênios</p>
                    </div>
                    <Switch
                      id="tissIntegration"
                      checked={settings.tissIntegration}
                      onCheckedChange={(checked) => handleSettingChange('tissIntegration', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="labIntegration">Integração Laboratorial</Label>
                      <p className="text-sm text-muted-foreground">Conectar com laboratórios</p>
                    </div>
                    <Switch
                      id="labIntegration"
                      checked={settings.labIntegration}
                      onCheckedChange={(checked) => handleSettingChange('labIntegration', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pharmacyIntegration">Integração Farmácia</Label>
                      <p className="text-sm text-muted-foreground">Conectar com farmácias</p>
                    </div>
                    <Switch
                      id="pharmacyIntegration"
                      checked={settings.pharmacyIntegration}
                      onCheckedChange={(checked) => handleSettingChange('pharmacyIntegration', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="imagingIntegration">Integração de Imagens</Label>
                      <p className="text-sm text-muted-foreground">Conectar com sistemas de imagem</p>
                    </div>
                    <Switch
                      id="imagingIntegration"
                      checked={settings.imagingIntegration}
                      onCheckedChange={(checked) => handleSettingChange('imagingIntegration', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Configurações de Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBackup">Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">Realizar backup automático dos dados</p>
                    </div>
                    <Switch
                      id="autoBackup"
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="backupFrequency">Frequência do Backup</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="backupRetention">Retenção de Backups (dias)</Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      value={settings.backupRetention}
                      onChange={(e) => handleSettingChange('backupRetention', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cloudBackup">Backup na Nuvem</Label>
                      <p className="text-sm text-muted-foreground">Armazenar backups na nuvem</p>
                    </div>
                    <Switch
                      id="cloudBackup"
                      checked={settings.cloudBackup}
                      onCheckedChange={(checked) => handleSettingChange('cloudBackup', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Status do Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Último Backup:</span>
                      <span className="text-sm font-medium">
                        {backupStatus.lastBackup ? backupStatus.lastBackup.toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Próximo Backup:</span>
                      <span className="text-sm font-medium">
                        {backupStatus.nextBackup ? backupStatus.nextBackup.toLocaleString('pt-BR') : 'Não agendado'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tamanho:</span>
                      <span className="text-sm font-medium">{backupStatus.backupSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Integridade:</span>
                      <Badge className={
                        backupStatus.integrityStatus === 'valid' ? 'bg-green-100 text-green-800' :
                        backupStatus.integrityStatus === 'invalid' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {backupStatus.integrityStatus === 'valid' ? 'Válido' :
                         backupStatus.integrityStatus === 'invalid' ? 'Inválido' : 'Desconhecido'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Ações de Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button 
                    className="medical-button-primary h-20 flex flex-col gap-2" 
                    onClick={handleManualBackup}
                    disabled={loading}
                  >
                    <Download className="w-6 h-6" />
                    <span>{loading ? 'Processando...' : 'Backup Manual'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2 hover:bg-primary/10"
                    onClick={handleRestoreBackup}
                  >
                    <Upload className="w-6 h-6" />
                    <span>Restaurar Backup</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2 hover:bg-medical-green/10"
                    onClick={handleCheckIntegrity}
                    disabled={loading}
                  >
                    <RefreshCw className="w-6 h-6" />
                    <span>{loading ? 'Verificando...' : 'Verificar Integridade'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={handleImportSettings}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button variant="outline" onClick={handleTestIntegrations}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Testar Integrações
            </Button>
            <Button variant="outline" onClick={() => {
              loadSettingsData()
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
          <Button 
            className="medical-button-primary" 
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        {/* Import Settings Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Configurações
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Arquivo JSON</Label>
                <Input 
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        // Import settings to PostgreSQL
                        const result = await apiService.importSettings(file)
                        if (result && result.success) {
                          toast.success('Configurações importadas com sucesso!')
                          setShowImportModal(false)
                          await loadSettingsData() // Reload data from PostgreSQL
                        } else {
                          toast.error('Erro ao importar configurações')
                        }
                      } catch (error) {
                        console.error('Error importing settings:', error)
                        toast.error('Erro ao importar configurações. Arquivo inválido.')
                      }
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Formato esperado: Arquivo JSON com configurações válidas</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restore Backup Modal */}
        <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Restaurar Backup
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-file">Arquivo de Backup</Label>
                <Input 
                  id="backup-file"
                  type="file"
                  accept=".sql,.backup,.zip"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        // Restore backup from PostgreSQL
                        const result = await apiService.restoreBackup(file)
                        if (result && result.success) {
                          toast.success('Backup restaurado com sucesso!')
                          setShowRestoreModal(false)
                          await loadSettingsData() // Reload data from PostgreSQL
                        } else {
                          toast.error('Erro ao restaurar backup')
                        }
                      } catch (error) {
                        console.error('Error restoring backup:', error)
                        toast.error('Erro ao restaurar backup')
                      }
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Formato esperado: Arquivo de backup (.sql, .backup, .zip)</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowRestoreModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Modal */}
        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Reset
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja resetar todas as configurações para os valores padrão?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowResetModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={async () => {
                  try {
                    await handleResetSettings()
                    setShowResetModal(false)
                  } catch (error) {
                    console.error('Error resetting settings:', error)
                    toast.error('Erro ao resetar configurações')
                  }
                }}>
                  Resetar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

export default Configuracoes
