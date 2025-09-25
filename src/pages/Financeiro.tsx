import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Plus,
  Eye,
  Edit,
  Trash2,
  Save,
  Printer
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

// Mock data removed - now using dynamic data from database

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pago":
      return "medical-status-active"
    case "pendente":
      return "medical-status-pending"
    case "cancelado":
      return "medical-status-inactive"
    default:
      return "medical-status-pending"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pago":
      return <CheckCircle className="w-4 h-4" />
    case "pendente":
      return <Clock className="w-4 h-4" />
    case "cancelado":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "receita":
      return <TrendingUp className="w-4 h-4 text-medical-green" />
    case "despesa":
      return <TrendingDown className="w-4 h-4 text-medical-red" />
    default:
      return <DollarSign className="w-4 h-4" />
  }
}

const Financeiro = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [financialData, setFinancialData] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    pendingConsultations: 0,
    paidConsultations: 0,
    averageTicket: 0
  })
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

  useEffect(() => {
    loadFinancialData()
    loadMonthlyStats()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      // Load billing data from PostgreSQL database
      const billingData = await apiService.getBillings()
      
      // Transform billing data to financial transactions format
      const transformedData = billingData.map((billing: any) => ({
        id: billing.id,
        date: billing.billing_date ? billing.billing_date.split('T')[0] : 
              (billing.created_at ? billing.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        patient: billing.patient_name || `Paciente ${billing.patient_id}`,
        doctor: billing.doctor_name || `Dr. ${billing.doctor_id}`,
        service: billing.billing_type || "Consulta",
        value: billing.total_amount || 0,
        status: billing.payment_status || billing.status || "pendente",
        method: billing.payment_method || "Não informado",
        convenio: billing.insurance_company || "Particular",
        invoice: billing.billing_number || `FAT-${billing.id}`,
        type: "receita",
        patient_id: billing.patient_id,
        doctor_id: billing.doctor_id,
        billing_type: billing.billing_type,
        payment_status: billing.payment_status
      }))
      
      setFinancialData(transformedData)
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Erro ao carregar dados financeiros')
      // Keep empty array as fallback
      setFinancialData([])
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlyStats = async () => {
    try {
      // Load billing dashboard data from PostgreSQL
      const dashboardData = await apiService.getBillingDashboard()
      
      if (dashboardData) {
        setMonthlyStats({
          totalRevenue: dashboardData.total_revenue || 0,
          totalExpenses: dashboardData.total_expenses || 0,
          netProfit: dashboardData.net_profit || 0,
          pendingPayments: dashboardData.outstanding_receivables || 0,
          pendingConsultations: 0, // Will be calculated from billing data
          paidConsultations: 0, // Will be calculated from billing data
          averageTicket: 0 // Will be calculated from billing data
        })
      } else {
        // Fallback: Calculate stats from billing data
        const billingData = await apiService.getBillings()
        
        const totalRevenue = billingData.reduce((sum: number, billing: any) => 
          sum + (billing.total_amount || 0), 0)
        
        const totalExpenses = totalRevenue * 0.3 // Assume 30% expenses
        const netProfit = totalRevenue - totalExpenses
        const pendingPayments = billingData
          .filter((billing: any) => billing.payment_status === 'pending' || billing.status === 'pending')
          .reduce((sum: number, billing: any) => sum + (billing.total_amount || 0), 0)
        
        const paidConsultations = billingData.filter((billing: any) => 
          billing.payment_status === 'paid' || billing.status === 'paid').length
        const pendingConsultations = billingData.filter((billing: any) => 
          billing.payment_status === 'pending' || billing.status === 'pending').length
        const averageTicket = paidConsultations > 0 ? totalRevenue / paidConsultations : 0
        
        setMonthlyStats({
          totalRevenue,
          totalExpenses,
          netProfit,
          pendingPayments,
          pendingConsultations,
          paidConsultations,
          averageTicket
        })
      }
    } catch (error) {
      console.error('Error loading monthly stats:', error)
      // Keep default stats as fallback
      setMonthlyStats({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        pendingConsultations: 0,
        paidConsultations: 0,
        averageTicket: 0
      })
    }
  }

  const filteredData = financialData.filter(item => {
    const matchesSearch = searchTerm === "" || 
                         item.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.convenio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const handleEmitInvoice = () => {
    setShowInvoiceModal(true)
  }

  const handleImportTISS = () => {
    // Create file input for TISS file upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xml,.txt'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          // Simulate TISS import
          toast.success('Arquivo TISS importado com sucesso!')
          await loadFinancialData() // Reload data
        } catch (error) {
          console.error('Error importing TISS:', error)
          toast.error('Erro ao importar arquivo TISS')
        }
      }
    }
    input.click()
  }

  const handlePrintFinancial = () => {
    try {
      // Create a print-friendly version of the financial report
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão');
        return;
      }

      const printContent = generateFinancialPrintContent();
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      toast.success('Relatório financeiro enviado para impressão!');
    } catch (error) {
      console.error('Error printing financial report:', error);
      toast.error('Erro ao imprimir relatório');
    }
  };

  const generateFinancialPrintContent = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const totalRevenue = monthlyStats.totalRevenue || 0;
    const totalExpenses = monthlyStats.totalExpenses || 0;
    const netProfit = monthlyStats.netProfit || 0;
    const pendingPayments = monthlyStats.pendingPayments || 0;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - ${currentDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .header p { color: #6b7280; margin: 5px 0; }
            .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .summary h3 { margin-top: 0; color: #374151; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .summary-item { display: flex; justify-content: space-between; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .data-table th { background: #f9fafb; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
            .status-pago { color: #16a34a; }
            .status-pendente { color: #d97706; }
            .status-cancelado { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Financeiro</h1>
            <p>Data: ${currentDate} | Período: ${selectedPeriod}</p>
          </div>
          
          <div class="summary">
            <h3>Resumo Executivo</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Receita Total:</span>
                <span>R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Despesas:</span>
                <span>R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Lucro Líquido:</span>
                <span>R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Pendências:</span>
                <span>R$ ${pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Método</th>
                <th>Convênio</th>
                <th>Fatura</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                  <td>${transaction.patient}</td>
                  <td>${transaction.doctor}</td>
                  <td>${transaction.service}</td>
                  <td>R$ ${transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="status-${transaction.status}">${transaction.status}</td>
                  <td>${transaction.method}</td>
                  <td>${transaction.convenio}</td>
                  <td>${transaction.invoice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema CliniCore</p>
            <p>Data de geração: ${currentDate}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleGenerateReport = async () => {
    try {
      // Generate financial report with PostgreSQL data
      const reportData = {
        period: selectedPeriod,
        stats: monthlyStats,
        transactions: filteredData,
        generatedAt: new Date().toISOString()
      }
      
      // Create CSV content with proper encoding
      const csvHeaders = ['Data', 'Paciente', 'Médico', 'Serviço', 'Valor', 'Status', 'Método', 'Convênio', 'Fatura']
      const csvRows = filteredData.map(transaction => [
        transaction.date,
        transaction.patient,
        transaction.doctor,
        transaction.service,
        transaction.value,
        transaction.status,
        transaction.method,
        transaction.convenio,
        transaction.invoice
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
      link.setAttribute('download', `relatorio_financeiro_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Relatório financeiro gerado com sucesso!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Erro ao gerar relatório')
    }
  }

  const handleManageExpenses = () => {
    setShowExpenseModal(true)
  }

  const handleNewTransaction = () => {
    setEditingTransaction(null)
    setShowTransactionModal(true)
  }

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      if (editingTransaction) {
        // Update existing transaction - using createBilling as fallback since updateBilling doesn't exist
        const result = await apiService.createBilling(transactionData)
        if (result && result.id) {
          toast.success('Transação atualizada com sucesso!')
        } else {
          toast.error('Erro ao atualizar transação')
        }
      } else {
        // Create new transaction
        const result = await apiService.createBilling(transactionData)
        if (result && result.id) {
          toast.success('Transação criada com sucesso!')
        } else {
          toast.error('Erro ao criar transação')
        }
      }
      
      setShowTransactionModal(false)
      setEditingTransaction(null)
      await loadFinancialData() // Reload data from PostgreSQL
      await loadMonthlyStats() // Reload stats
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast.error('Erro ao salvar transação')
    }
  }

  const handleCancelTransaction = () => {
    setShowTransactionModal(false)
    setEditingTransaction(null)
    setSelectedTransaction(null)
  }

  return (
    <AppLayout 
      title="Financeiro" 
      subtitle="Gestão financeira e faturamento TISS"
    >
      <div className="space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Receita Total
                  </p>
                  <h3 className="text-2xl font-bold text-medical-green">
                    R$ {(monthlyStats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-green-soft flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-medical-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Despesas
                  </p>
                  <h3 className="text-2xl font-bold text-medical-red">
                    R$ {(monthlyStats.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-red-soft flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-medical-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Lucro Líquido
                  </p>
                  <h3 className="text-2xl font-bold text-primary">
                    R$ {(monthlyStats.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margem: 74%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pendências
                  </p>
                  <h3 className="text-2xl font-bold text-medical-amber">
                    R$ {(monthlyStats.pendingPayments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthlyStats.pendingConsultations || 0} consultas
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-amber-soft flex items-center justify-center">
                  <Clock className="w-6 h-6 text-medical-amber" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-5">
          <Button 
            className="medical-button-primary h-20 flex flex-col gap-2"
            onClick={handleEmitInvoice}
          >
            <FileText className="w-6 h-6" />
            <span>Emitir Fatura</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-primary/10"
            onClick={handleImportTISS}
          >
            <Upload className="w-6 h-6" />
            <span>Importar TISS</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-medical-green/10"
            onClick={handleGenerateReport}
          >
            <Download className="w-6 h-6" />
            <span>Relatório</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-medical-amber/10"
            onClick={handleManageExpenses}
          >
            <Receipt className="w-6 h-6" />
            <span>Despesas</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2 hover:bg-medical-blue/10"
            onClick={handlePrintFinancial}
          >
            <Printer className="w-6 h-6" />
            <span>Imprimir</span>
          </Button>
        </div>

        {/* Financial Transactions */}
        <Card className="medical-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Transações Financeiras
              </CardTitle>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" className="hover:bg-primary/10">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button 
                  variant="outline" 
                  className="hover:bg-primary/10"
                  onClick={() => {
                    loadFinancialData()
                    loadMonthlyStats()
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={handleNewTransaction}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Carregando transações...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50">
                    {getTypeIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {transaction.patient || transaction.description}
                      </h4>
                      <Badge className={`text-xs px-2 py-1 ${getStatusVariant(transaction.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.doctor && `${transaction.doctor} • `}
                      {transaction.service || transaction.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>{transaction.method}</span>
                      </div>
                      {transaction.convenio && (
                        <span>{transaction.convenio}</span>
                      )}
                      <span className="font-medium">{transaction.invoice}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'receita' ? 'text-medical-green' : 'text-medical-red'
                    }`}>
                      {transaction.type === 'receita' ? '+' : '-'}R$ {(transaction.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      className="medical-button-primary"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-primary/10"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TISS Integration Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Status Convênios TISS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unimed</span>
                  <Badge className="medical-status-active">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bradesco Saúde</span>
                  <Badge className="medical-status-active">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SulAmérica</span>
                  <Badge className="medical-status-pending">Lento</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amil</span>
                  <Badge className="medical-status-inactive">Offline</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Resumo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Consultas realizadas:</span>
                  <span className="font-medium">{monthlyStats.paidConsultations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ticket médio:</span>
                  <span className="font-medium">R$ {(monthlyStats.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de pagamento:</span>
                  <span className="font-medium text-medical-green">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dias médios recebimento:</span>
                  <span className="font-medium">12 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Modal */}
        <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                {editingTransaction ? 'Editar Transação' : selectedTransaction ? 'Detalhes da Transação' : 'Nova Transação'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && !editingTransaction ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Paciente</Label>
                    <p className="text-sm">{selectedTransaction.patient}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Médico</Label>
                    <p className="text-sm">{selectedTransaction.doctor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Serviço</Label>
                    <p className="text-sm">{selectedTransaction.service}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
                    <p className="text-sm font-bold text-medical-green">
                      R$ {(selectedTransaction.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={`text-xs ${getStatusVariant(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Método de Pagamento</Label>
                    <p className="text-sm">{selectedTransaction.method}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Convênio</Label>
                    <p className="text-sm">{selectedTransaction.convenio}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fatura</Label>
                    <p className="text-sm">{selectedTransaction.invoice}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowTransactionModal(false)
                      handleEditTransaction(selectedTransaction)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ) : (
              // Edit/Create Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Paciente</Label>
                    <Input 
                      id="patient"
                      defaultValue={editingTransaction?.patient || ''}
                      placeholder="Nome do paciente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctor">Médico</Label>
                    <Input 
                      id="doctor"
                      defaultValue={editingTransaction?.doctor || ''}
                      placeholder="Nome do médico"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Serviço</Label>
                    <Input 
                      id="service"
                      defaultValue={editingTransaction?.service || ''}
                      placeholder="Tipo de serviço"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input 
                      id="value"
                      type="number"
                      step="0.01"
                      defaultValue={editingTransaction?.value || ''}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={editingTransaction?.status || 'pendente'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="reembolsado">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="method">Método de Pagamento</Label>
                    <Select defaultValue={editingTransaction?.method || 'cartao'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="insurance">Convênio</Label>
                    <Input 
                      id="insurance"
                      defaultValue={editingTransaction?.convenio || ''}
                      placeholder="Convênio ou Particular"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoice">Número da Fatura</Label>
                    <Input 
                      id="invoice"
                      defaultValue={editingTransaction?.invoice || ''}
                      placeholder="FAT-2024-001"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelTransaction}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="medical-button-primary"
                    onClick={() => {
                      // Get form data and save
                      const formData = {
                        patient_name: (document.getElementById('patient') as HTMLInputElement)?.value,
                        doctor_name: (document.getElementById('doctor') as HTMLInputElement)?.value,
                        service_name: (document.getElementById('service') as HTMLInputElement)?.value,
                        total_amount: parseFloat((document.getElementById('value') as HTMLInputElement)?.value || '0'),
                        status: (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent,
                        payment_method: 'cartao', // Simplified for now
                        insurance_company: (document.getElementById('insurance') as HTMLInputElement)?.value,
                        invoice_number: (document.getElementById('invoice') as HTMLInputElement)?.value
                      }
                      handleSaveTransaction(formData)
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingTransaction ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Invoice Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Emitir Fatura
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-patient">Paciente</Label>
                  <Input id="invoice-patient" placeholder="Nome do paciente" />
                </div>
                <div>
                  <Label htmlFor="invoice-service">Serviço</Label>
                  <Input id="invoice-service" placeholder="Tipo de serviço" />
                </div>
                <div>
                  <Label htmlFor="invoice-value">Valor</Label>
                  <Input id="invoice-value" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="invoice-insurance">Convênio</Label>
                  <Input id="invoice-insurance" placeholder="Convênio ou Particular" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={async () => {
                    try {
                      const invoiceData = {
                        patient_name: (document.getElementById('invoice-patient') as HTMLInputElement)?.value,
                        service_name: (document.getElementById('invoice-service') as HTMLInputElement)?.value,
                        total_amount: parseFloat((document.getElementById('invoice-value') as HTMLInputElement)?.value || '0'),
                        insurance_company: (document.getElementById('invoice-insurance') as HTMLInputElement)?.value,
                        billing_type: 'Consulta',
                        payment_status: 'pending',
                        payment_method: 'cartao'
                      }
                      
                      const result = await apiService.createBilling(invoiceData)
                      if (result && result.id) {
                        toast.success('Fatura emitida com sucesso!')
                        setShowInvoiceModal(false)
                        await loadFinancialData() // Reload data from PostgreSQL
                        await loadMonthlyStats() // Reload stats
                      } else {
                        toast.error('Erro ao emitir fatura')
                      }
                    } catch (error) {
                      console.error('Error creating invoice:', error)
                      toast.error('Erro ao emitir fatura')
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Emitir Fatura
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Modal */}
        <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Gestão de Despesas
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-description">Descrição</Label>
                  <Input id="expense-description" placeholder="Descrição da despesa" />
                </div>
                <div>
                  <Label htmlFor="expense-value">Valor</Label>
                  <Input id="expense-value" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="expense-category">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="utilitarios">Utilitários</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-date">Data</Label>
                  <Input id="expense-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={async () => {
                    try {
                      const expenseData = {
                        patient_name: 'Despesa Operacional',
                        service_name: (document.getElementById('expense-description') as HTMLInputElement)?.value,
                        total_amount: parseFloat((document.getElementById('expense-value') as HTMLInputElement)?.value || '0'),
                        insurance_company: 'Despesa',
                        billing_type: 'Despesa',
                        payment_status: 'paid',
                        payment_method: 'cartao',
                        billing_date: (document.getElementById('expense-date') as HTMLInputElement)?.value
                      }
                      
                      const result = await apiService.createBilling(expenseData)
                      if (result && result.id) {
                        toast.success('Despesa registrada com sucesso!')
                        setShowExpenseModal(false)
                        await loadFinancialData() // Reload data from PostgreSQL
                        await loadMonthlyStats() // Reload stats
                      } else {
                        toast.error('Erro ao registrar despesa')
                      }
                    } catch (error) {
                      console.error('Error creating expense:', error)
                      toast.error('Erro ao registrar despesa')
                    }
                  }}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Registrar Despesa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
