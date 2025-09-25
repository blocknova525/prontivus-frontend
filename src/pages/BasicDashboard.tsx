import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Activity,
  FileText,
  CreditCard,
  Bell
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  monthlyRevenue: number;
  activeDoctors: number;
}

interface RecentActivity {
  id: number;
  type: 'appointment' | 'patient' | 'payment' | 'alert';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

interface TodayAppointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  time: string;
  type: string;
  status: 'confirmed' | 'waiting' | 'completed' | 'cancelled';
}

const BasicDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    monthlyRevenue: 0,
    activeDoctors: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real data from API
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Load patients count
      const patientsResponse = await apiService.getPatients();
      const totalPatients = patientsResponse?.length || 0;
      
      // Load today's appointments
      const appointmentsResponse = await apiService.getAppointments({ date: today });
      const todayAppointmentsData = appointmentsResponse || [];
      
      // Load doctors count
      const doctorsResponse = await apiService.getUsers({ role: 'doctor' });
      const activeDoctors = doctorsResponse?.length || 0;
      
      // Calculate stats
      const todayAppointmentsCount = todayAppointmentsData.length;
      const pendingAppointmentsCount = todayAppointmentsData.filter((apt: any) => 
        ['scheduled', 'waiting'].includes(apt.status)
      ).length;
      const completedAppointmentsCount = todayAppointmentsData.filter((apt: any) => 
        apt.status === 'completed'
      ).length;
      
      // Load financial data (mock for now)
      const monthlyRevenue = 45680.50; // TODO: Implement financial API
      
      setStats({
        totalPatients,
        todayAppointments: todayAppointmentsCount,
        pendingAppointments: pendingAppointmentsCount,
        completedAppointments: completedAppointmentsCount,
        monthlyRevenue,
        activeDoctors
      });

      setRecentActivity([
        {
          id: 1,
          type: 'appointment',
          title: 'Nova consulta agendada',
          description: 'Ana Costa - Dr. João Silva às 14:00',
          time: '10 minutos atrás',
          status: 'success'
        },
        {
          id: 2,
          type: 'patient',
          title: 'Paciente cadastrado',
          description: 'Pedro Oliveira foi registrado no sistema',
          time: '25 minutos atrás',
          status: 'success'
        },
        {
          id: 3,
          type: 'payment',
          title: 'Pagamento recebido',
          description: 'R$ 150,00 - Consulta Dra. Maria Santos',
          time: '1 hora atrás',
          status: 'success'
        },
        {
          id: 4,
          type: 'alert',
          title: 'Consulta cancelada',
          description: 'Roberto Silva cancelou consulta de hoje',
          time: '2 horas atrás',
          status: 'warning'
        }
      ]);

      // Set today's appointments from API data
      setTodayAppointments(todayAppointmentsData.map((apt: any) => ({
        id: apt.id,
        patient_name: apt.patient_name || 'Paciente',
        doctor_name: apt.doctor_name || 'Médico',
        time: apt.appointment_time || '00:00',
        type: apt.type || 'Consulta',
        status: apt.status || 'scheduled'
      })));
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados do dashboard'));
      
      // Fallback to empty data instead of mock data
      setStats({
        totalPatients: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        monthlyRevenue: 0,
        activeDoctors: 0
      });

      setTodayAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'waiting': return 'Aguardando';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'patient': return <UserPlus className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Bem-vindo ao CliniCore - {format(new Date(), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </Button>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedAppointments} concluídas, {stats.pendingAppointments} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDoctors}</div>
              <p className="text-xs text-muted-foreground">
                Todos os médicos disponíveis hoje
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Consultas de Hoje
              </CardTitle>
              <CardDescription>
                Agenda do dia {format(new Date(), 'dd/MM/yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{appointment.patient_name}</h4>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {appointment.doctor_name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{appointment.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Ver Agenda Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)} bg-opacity-10`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Ver Todas as Atividades
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <UserPlus className="w-6 h-6" />
                <span className="text-xs">Novo Paciente</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span className="text-xs">Agendar Consulta</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <FileText className="w-6 h-6" />
                <span className="text-xs">Prontuário</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <CreditCard className="w-6 h-6" />
                <span className="text-xs">Faturamento</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-xs">Lista Pacientes</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-xs">Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default BasicDashboard;
