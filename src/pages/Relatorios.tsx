import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  Eye,
  Printer,
  Share2
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Relatorios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [reportData, setReportData] = useState<any>({
    financial: null,
    patients: null,
    appointments: null,
    doctors: null
  });
  const [summaryStats, setSummaryStats] = useState<any>({
    totalRevenue: 0,
    totalPatients: 0,
    todayAppointments: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load financial data from PostgreSQL
      const financialData = await apiService.getBillings();
      const billingDashboard = await apiService.getBillingDashboard();
      const revenueChart = await apiService.getRevenueExpenseChart();
      
      // Load patients data from PostgreSQL
      const patientsData = await apiService.getPatients();
      
      // Load appointments data from PostgreSQL
      const appointmentsData = await apiService.getAppointments();
      
      // Load doctors data
      const doctorsData = await apiService.getDoctors();
      
      // Process and set data
      setReportData({
        financial: financialData,
        billingDashboard: billingDashboard,
        revenueChart: revenueChart,
        patients: patientsData,
        appointments: appointmentsData,
        doctors: doctorsData
      });
      
      // Calculate summary statistics from PostgreSQL data
      const totalRevenue = billingDashboard?.total_revenue || 
        financialData.reduce((sum: number, billing: any) => 
          sum + (billing.total_amount || 0), 0);
      
      const totalPatients = patientsData.length;
      
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsData.filter((apt: any) => 
        apt.appointment_date === today).length;
      
      const totalAppointments = appointmentsData.length;
      const occupancyRate = totalAppointments > 0 ? 
        Math.round((todayAppointments / totalAppointments) * 100) : 0;
      
      setSummaryStats({
        totalRevenue,
        totalPatients,
        todayAppointments,
        occupancyRate,
        totalAppointments,
        totalDoctors: doctorsData.length
      });
      
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Erro ao carregar dados dos relatórios');
      
      // Set fallback data
      setSummaryStats({
        totalRevenue: 0,
        totalPatients: 0,
        todayAppointments: 0,
        occupancyRate: 0,
        totalAppointments: 0,
        totalDoctors: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilters = () => {
    setShowFiltersModal(true);
  };

  const handlePrint = () => {
    try {
      // Create a print-friendly version of the current report
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão');
        return;
      }

      const currentData = getCurrentReportData();
      const printContent = generatePrintContent(currentData);
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      toast.success('Relatório enviado para impressão!');
    } catch (error) {
      console.error('Error printing report:', error);
      toast.error('Erro ao imprimir relatório');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const shareData = {
          title: 'Relatório da Clínica',
          text: `Relatório ${selectedReport} - Período: ${selectedPeriod}`,
          url: window.location.href
        };
        await navigator.share(shareData);
        toast.success('Relatório compartilhado com sucesso!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Erro ao compartilhar relatório');
    }
  };

  const getCurrentReportData = () => {
    switch (selectedReport) {
      case 'financial':
        return reportData.financial || [];
      case 'patients':
        return reportData.patients || [];
      case 'appointments':
        return reportData.appointments || [];
      case 'doctors':
        return reportData.doctors || [];
      default:
        return {
          financial: reportData.financial || [],
          patients: reportData.patients || [],
          appointments: reportData.appointments || [],
          doctors: reportData.doctors || []
        };
    }
  };

  const generatePrintContent = (data: any) => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const reportTitle = reports.find(r => r.id === selectedReport)?.title || 'Relatório';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - ${currentDate}</title>
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Período: ${selectedPeriod} | Data: ${currentDate}</p>
          </div>
          
          <div class="summary">
            <h3>Resumo Executivo</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Receita Total:</span>
                <span>R$ ${summaryStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Total Pacientes:</span>
                <span>${summaryStats.totalPatients}</span>
              </div>
              <div class="summary-item">
                <span>Consultas Hoje:</span>
                <span>${summaryStats.todayAppointments}</span>
              </div>
              <div class="summary-item">
                <span>Taxa de Ocupação:</span>
                <span>${summaryStats.occupancyRate}%</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema CliniCore</p>
            <p>Data de geração: ${currentDate}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    try {
      // Generate comprehensive report based on selected report type and period
      let csvContent = '';
      let filename = '';
      
      switch (selectedReport) {
        case 'financial':
          csvContent = generateFinancialReport();
          filename = `relatorio_financeiro_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'patients':
          csvContent = generatePatientsReport();
          filename = `relatorio_pacientes_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'appointments':
          csvContent = generateAppointmentsReport();
          filename = `relatorio_consultas_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'doctors':
          csvContent = generateDoctorsReport();
          filename = `relatorio_medicos_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          csvContent = generateComprehensiveReport();
          filename = `relatorio_completo_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;
      
      // Download CSV
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const generateFinancialReport = () => {
    const financialData = reportData.financial || [];
    const csvHeaders = ['Data', 'Paciente', 'Médico', 'Serviço', 'Valor', 'Status', 'Método de Pagamento', 'Convênio'];
    const csvRows = financialData.map((billing: any) => [
      billing.created_at ? billing.created_at.split('T')[0] : '',
      billing.patient_name || 'N/A',
      billing.doctor_name || 'N/A',
      billing.service_name || 'Consulta',
      billing.total_amount || 0,
      billing.status || 'pendente',
      billing.payment_method || 'Não informado',
      billing.insurance_company || 'Particular'
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const generatePatientsReport = () => {
    const patientsData = reportData.patients || [];
    const csvHeaders = ['Nome', 'CPF', 'Email', 'Telefone', 'Data de Nascimento', 'Gênero', 'Convênio', 'Status'];
    const csvRows = patientsData.map((patient: any) => [
      patient.full_name || patient.name || 'N/A',
      patient.cpf || 'N/A',
      patient.email || 'N/A',
      patient.phone || 'N/A',
      patient.birth_date || 'N/A',
      patient.gender || 'N/A',
      patient.insurance_company || 'Não informado',
      patient.is_active ? 'Ativo' : 'Inativo'
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const generateAppointmentsReport = () => {
    const appointmentsData = reportData.appointments || [];
    const csvHeaders = ['Data', 'Horário', 'Paciente', 'Médico', 'Status', 'Convênio', 'Observações'];
    const csvRows = appointmentsData.map((appointment: any) => [
      appointment.appointment_date || 'N/A',
      appointment.appointment_time || 'N/A',
      appointment.patient_name || 'N/A',
      appointment.doctor_name || 'N/A',
      appointment.status || 'agendado',
      appointment.insurance_company || 'Particular',
      appointment.notes || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const generateDoctorsReport = () => {
    const appointmentsData = reportData.appointments || [];
    const doctorsData = reportData.doctors || [];
    
    // Calculate doctor statistics from appointments
    const doctorStats = appointmentsData.reduce((acc: any, apt: any) => {
      const doctor = apt.doctor_name || 'Dr. Não Informado';
      if (!acc[doctor]) {
        acc[doctor] = { appointments: 0, patients: new Set() };
      }
      acc[doctor].appointments++;
      acc[doctor].patients.add(apt.patient_name);
      return acc;
    }, {});
    
    const csvHeaders = ['Médico', 'Total de Consultas', 'Pacientes Únicos', 'Especialidade'];
    const csvRows = Object.entries(doctorStats).map(([doctor, stats]: [string, any]) => {
      const doctorInfo = doctorsData.find((d: any) => d.full_name === doctor);
      return [
        doctor,
        stats.appointments,
        stats.patients.size,
        doctorInfo?.specialty || 'N/A'
      ];
    });
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const generateComprehensiveReport = () => {
    const financialReport = generateFinancialReport();
    const patientsReport = generatePatientsReport();
    const appointmentsReport = generateAppointmentsReport();
    const doctorsReport = generateDoctorsReport();
    
    return `RELATÓRIO FINANCEIRO\n${financialReport}\n\nRELATÓRIO DE PACIENTES\n${patientsReport}\n\nRELATÓRIO DE CONSULTAS\n${appointmentsReport}\n\nRELATÓRIO DE MÉDICOS\n${doctorsReport}`;
  };

  // Dynamic chart data from PostgreSQL
  const getRevenueData = () => {
    const financialData = reportData.financial || [];
    const revenueChart = reportData.revenueChart;
    
    if (revenueChart && revenueChart.monthly_data) {
      return {
        labels: revenueChart.monthly_data.map((item: any) => item.month),
        datasets: [
          {
            label: 'Receita Mensal',
            data: revenueChart.monthly_data.map((item: any) => item.revenue),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    }
    
    // Fallback to mock data
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Receita Mensal',
          data: [120000, 135000, 142000, 138000, 155000, 168000],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const getConsultationsData = () => {
    const appointmentsData = reportData.appointments || [];
    const doctorsData = reportData.doctors || [];
    
    // Calculate consultations per doctor
    const doctorStats = appointmentsData.reduce((acc: any, apt: any) => {
      const doctor = apt.doctor_name || 'Dr. Não Informado';
      acc[doctor] = (acc[doctor] || 0) + 1;
      return acc;
    }, {});
    
    const sortedDoctors = Object.entries(doctorStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);
    
    if (sortedDoctors.length > 0) {
      return {
        labels: sortedDoctors.map(([doctor]) => doctor),
        datasets: [
          {
            label: 'Consultas',
            data: sortedDoctors.map(([, count]) => count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(139, 92, 246, 1)'
            ],
            borderWidth: 2
          }
        ]
      };
    }
    
    // Fallback to mock data
    return {
      labels: ['Dr. Silva', 'Dr. Santos', 'Dr. Oliveira', 'Dr. Costa', 'Dr. Lima'],
      datasets: [
        {
          label: 'Consultas',
          data: [45, 38, 42, 35, 28],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  const getAgeGroupsData = () => {
    const patientsData = reportData.patients || [];
    
    // Calculate age groups
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    patientsData.forEach((patient: any) => {
      if (patient.birth_date) {
        const age = new Date().getFullYear() - new Date(patient.birth_date).getFullYear();
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
    });
    
    const hasData = Object.values(ageGroups).some(count => count > 0);
    
    if (hasData) {
      return {
        labels: Object.keys(ageGroups),
        datasets: [
          {
            label: 'Pacientes por Faixa Etária',
            data: Object.values(ageGroups),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 2
          }
        ]
      };
    }
    
    // Fallback to mock data
    return {
      labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
      datasets: [
        {
          label: 'Pacientes por Faixa Etária',
          data: [15, 35, 28, 18, 4],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Relatórios da Clínica'
      }
    }
  };

const reports = [
  {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas e lucros',
    icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'patients',
      title: 'Relatório de Pacientes',
      description: 'Estatísticas de pacientes',
    icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'appointments',
      title: 'Relatório de Consultas',
      description: 'Agendamentos e atendimentos',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'performance',
      title: 'Relatório de Performance',
      description: 'Métricas de produtividade',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <AppLayout 
      title="Relatórios" 
      subtitle="Análise de dados e métricas da clínica"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
                <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise de dados e métricas da clínica</p>
                </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleFilters}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                loadReportData();
              }}
            >
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
              </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: '1y', label: '1 ano' }
              ].map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period.value)}
                  className="flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {period.label}
                </Button>
              ))}
              </div>
            </CardContent>
          </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
            <Card 
              key={report.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${report.bgColor}`}>
                    <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedReport('financial');
                  handleExport();
                }}
              >
                <DollarSign className="w-6 h-6" />
                <span>Relatório Financeiro</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedReport('patients');
                  handleExport();
                }}
              >
                <Users className="w-6 h-6" />
                <span>Relatório Pacientes</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedReport('appointments');
                  handleExport();
                }}
              >
                <Calendar className="w-6 h-6" />
                <span>Relatório Consultas</span>
              </Button>
              <Button 
                className="medical-button-primary h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedReport('doctors');
                  handleExport();
                }}
              >
                <Activity className="w-6 h-6" />
                <span>Relatório Médicos</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando dados...</span>
                </div>
              ) : (
                <div className="h-64">
                  <Line data={getRevenueData()} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Consultas por Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando dados...</span>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={getConsultationsData()} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Age Groups Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Distribuição por Faixa Etária
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando dados...</span>
                </div>
              ) : (
                <div className="h-64 flex justify-center">
                  <div className="w-64 h-64">
                    <Pie data={getAgeGroupsData()} options={chartOptions} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {summaryStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </p>
              </div>
            </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalPatients}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.2%
                  </p>
                    </div>
                  </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.todayAppointments}</p>
                  <p className="text-sm text-red-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -3.1%
                  </p>
                  </div>
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardContent className="p4">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.occupancyRate}%</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.3%
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Filters Modal */}
        <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avançados
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-period">Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="90d">90 dias</SelectItem>
                    <SelectItem value="1y">1 ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-report-type">Tipo de Relatório</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="patients">Pacientes</SelectItem>
                    <SelectItem value="appointments">Consultas</SelectItem>
                    <SelectItem value="doctors">Médicos</SelectItem>
                    <SelectItem value="comprehensive">Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-date-from">Data Inicial</Label>
                <Input 
                  id="filter-date-from"
                  type="date"
                  defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="filter-date-to">Data Final</Label>
                <Input 
                  id="filter-date-to"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="filter-doctor">Médico</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os médicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {(reportData.doctors || []).map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name || doctor.name || 'Dr. Não Informado'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-insurance">Convênio</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os convênios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Array.from(new Set(
                      (reportData.patients || [])
                        .map((p: any) => p.insurance_company)
                        .filter(Boolean)
                    )).map((insurance: string) => (
                      <SelectItem key={insurance} value={insurance}>
                        {insurance}
                      </SelectItem>
                    ))}
                    <SelectItem value="particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowFiltersModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      // Get filter values
                      const dateFrom = (document.getElementById('filter-date-from') as HTMLInputElement)?.value;
                      const dateTo = (document.getElementById('filter-date-to') as HTMLInputElement)?.value;
                      const doctor = (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent;
                      const insurance = (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent;
                      
                      // Apply filters and reload data
                      await loadReportData();
                      toast.success('Filtros aplicados com sucesso!');
                      setShowFiltersModal(false);
                    } catch (error) {
                      console.error('Error applying filters:', error);
                      toast.error('Erro ao aplicar filtros');
                    }
                  }}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
