import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  FileText,
  Stethoscope,
  Loader2,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { dashboardApi, DashboardMetrics, Appointment, PendingTask, FinancialSummary } from '@/lib/dashboardApi';
import { apiService } from '@/lib/api';

const Dashboard = () => {
  // State for dashboard data
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [metricsData, appointmentsData, tasksData, financialData] = await Promise.all([
        dashboardApi.getDashboardMetrics(),
        dashboardApi.getTodayAppointments(),
        dashboardApi.getPendingTasks(),
        dashboardApi.getFinancialSummary()
      ]);

      setMetrics(metricsData);
      setTodayAppointments(appointmentsData);
      setPendingTasks(tasksData);
      setFinancialData(financialData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'checkin':
        window.location.href = '/secretaria';
        break;
      case 'consultation':
        window.location.href = '/atendimento';
        break;
      case 'billing':
        window.location.href = '/financeiro';
        break;
      case 'reports':
        window.location.href = '/relatorios';
        break;
      case 'patients':
        window.location.href = '/secretaria/pacientes';
        break;
      case 'agenda':
        window.location.href = '/agenda';
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      // Update appointment status to cancelled instead of deleting
      await apiService.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Remove from local state
      setTodayAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Refresh dashboard data
      await loadDashboardData();
      
      console.log(`Appointment ${appointmentId} cancelled successfully`);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // Remove task from local state
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      
      console.log(`Task ${taskId} removed successfully`);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle="Carregando dados...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout title="Dashboard" subtitle="Erro ao carregar dados">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle="Visão geral da sua clínica"
    >
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral da sua clínica - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/agenda/novo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pacientes/novo">
              <Users className="w-4 h-4 mr-2" />
              Novo Paciente
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.length > 0 ? `${todayAppointments.length} agendadas` : 'Nenhuma consulta hoje'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.waitingPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.filter(task => task.priority === 'high').length} com prioridade alta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(financialData?.todayRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +{financialData?.growthRate || 0}% vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.occupancyRate && metrics.occupancyRate > 80 ? 'Excelente ocupação' : 'Ocupação moderada'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Consultas de Hoje</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/agenda">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todas
                </Link>
              </Button>
            </div>
            <CardDescription>
              Próximas consultas agendadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctor_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-medium">{appointment.appointment_time}</p>
                        <Badge 
                          variant={
                            appointment.status === 'confirmed' ? 'default' : 
                            appointment.status === 'waiting' ? 'secondary' :
                            appointment.status === 'completed' ? 'default' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {appointment.status === 'confirmed' ? 'Confirmada' : 
                           appointment.status === 'waiting' ? 'Aguardando' :
                           appointment.status === 'completed' ? 'Concluída' :
                           appointment.status === 'cancelled' ? 'Cancelada' :
                           'Agendada'}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        title="Cancelar consulta"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta agendada para hoje</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tarefas Pendentes</CardTitle>
              <Badge variant="destructive">{pendingTasks.length}</Badge>
            </div>
            <CardDescription>
              Ações que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-2 border rounded">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.type === 'insurance' ? 'Verificação de Convênio' :
                         task.type === 'exams' ? 'Exames' : 
                         task.type === 'consultation' ? 'Consulta' :
                         task.type === 'billing' ? 'Faturamento' : 'Outros'}
                      </p>
                      {task.patient_name && (
                        <p className="text-xs text-blue-600">{task.patient_name}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Remover tarefa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma tarefa pendente</p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => handleQuickAction('reports')}
            >
              Ver Todas as Tarefas
            </Button>
          </CardContent>
        </Card>

        {/* Revenue Snapshot */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>
                  Receita e despesas do mês atual
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  R$ {(financialData?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  R$ {(financialData?.monthlyExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Despesas</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {(financialData?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              </div>
            </div>
            
            {/* Additional financial info */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="text-center p-3 border rounded-lg bg-yellow-50">
                <p className="text-lg font-bold text-yellow-600">
                  R$ {(financialData?.pendingPayments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
              </div>
              <div className="text-center p-3 border rounded-lg bg-red-50">
                <p className="text-lg font-bold text-red-600">
                  R$ {(financialData?.overduePayments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Pagamentos Vencidos</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/financeiro">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Relatório Completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('checkin')}
            >
              <Users className="w-4 h-4 mr-2" />
              Check-in Paciente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('consultation')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Iniciar Consulta
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('billing')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Faturamento
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('patients')}
            >
              <Users className="w-4 h-4 mr-2" />
              Lista de Pacientes
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-primary/10" 
              onClick={() => handleQuickAction('agenda')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agenda Completa
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
