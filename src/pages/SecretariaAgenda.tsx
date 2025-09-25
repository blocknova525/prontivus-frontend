import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Loader2,
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: number;
  patient_name: string;
  patient_id: number;
  doctor_name: string;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  duration: number;
  patient_phone?: string;
  patient_email?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty?: string;
  is_active: boolean;
}

const SecretariaAgenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgendaData();
  }, [currentDate, selectedDoctor]);

  const loadAgendaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load doctors
      const doctorsResponse = await apiService.getUsers({ role: 'doctor' });
      setDoctors([
        { id: 0, name: 'Todos os Médicos', is_active: true },
        ...(doctorsResponse || []).map((doctor: any) => ({
          id: doctor.id,
          name: doctor.full_name,
          specialty: doctor.specialty,
          is_active: doctor.is_active
        }))
      ]);

      // Load appointments for the selected date
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const params: any = { date: dateStr };
      
      if (selectedDoctor !== 'all') {
        params.doctor_id = selectedDoctor;
      }

      const appointmentsResponse = await apiService.getAppointments(params);
      setAppointments(appointmentsResponse || []);
      
    } catch (err: any) {
      console.error('Error loading agenda data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados da agenda'));
      
      // Fallback to mock data
      setDoctors([
        { id: 0, name: 'Todos os Médicos', is_active: true },
        { id: 1, name: 'Dr. João Silva', specialty: 'Clínica Geral', is_active: true },
        { id: 2, name: 'Dra. Maria Santos', specialty: 'Cardiologia', is_active: true },
        { id: 3, name: 'Dr. Carlos Oliveira', specialty: 'Neurologia', is_active: true },
      ]);
      
      setAppointments([
        { 
          id: 1, 
          patient_name: 'Ana Costa', 
          patient_id: 1,
          doctor_name: 'Dr. João Silva', 
          doctor_id: 1,
          appointment_date: dateStr,
          appointment_time: '09:00', 
          type: 'Consulta', 
          status: 'confirmed',
          duration: 30,
          patient_phone: '(11) 99999-1111',
          patient_email: 'ana.costa@email.com'
        },
        { 
          id: 2, 
          patient_name: 'Pedro Oliveira', 
          patient_id: 2,
          doctor_name: 'Dra. Maria Santos', 
          doctor_id: 2,
          appointment_date: dateStr,
          appointment_time: '10:30', 
          type: 'Retorno', 
          status: 'waiting',
          duration: 30,
          patient_phone: '(11) 99999-2222',
          patient_email: 'pedro.oliveira@email.com'
        },
        { 
          id: 3, 
          patient_name: 'Mariana Lima', 
          patient_id: 3,
          doctor_name: 'Dr. Carlos Oliveira', 
          doctor_id: 3,
          appointment_date: dateStr,
          appointment_time: '14:00', 
          type: 'Consulta', 
          status: 'confirmed',
          duration: 45,
          patient_phone: '(11) 99999-3333',
          patient_email: 'mariana.lima@email.com'
        },
        { 
          id: 4, 
          patient_name: 'Roberto Silva', 
          patient_id: 4,
          doctor_name: 'Dr. João Silva', 
          doctor_id: 1,
          appointment_date: dateStr,
          appointment_time: '15:30', 
          type: 'Exame', 
          status: 'scheduled',
          duration: 60,
          patient_phone: '(11) 99999-4444',
          patient_email: 'roberto.silva@email.com'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'waiting': return 'Aguardando';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não Compareceu';
      default: return 'Pendente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <XCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await apiService.updateAppointment(appointmentId.toString(), { status: newStatus });
      // Reload data
      loadAgendaData();
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      setError(extractErrorMessage(err, 'Erro ao atualizar status da consulta'));
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <AppLayout 
      title="Agenda" 
      subtitle="Gestão de agendamentos e consultas"
    >
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">
            Gestão de agendamentos e consultas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <Link to="/agenda/novo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={view} onValueChange={(value: 'day' | 'week' | 'month') => setView(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentDate.toLocaleDateString('pt-BR')}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <div className="grid gap-6">
        {/* Day View */}
        {view === 'day' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Agenda do Dia - {currentDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>
                {appointments.length} consultas agendadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Carregando consultas...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadAgendaData}
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta agendada para este dia</p>
                  <Button asChild className="mt-4">
                    <Link to="/agenda/novo">
                      <Plus className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Link>
                  </Button>
                </div>
              ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{appointment.patient_name}</h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{getStatusText(appointment.status)}</span>
                            </Badge>
                      </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Médico:</strong> {appointment.doctor_name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Tipo:</strong> {appointment.type} • <strong>Duração:</strong> {appointment.duration}min
                          </p>
                          {appointment.patient_phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {appointment.patient_phone}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{appointment.notes}"
                            </p>
                          )}
                      </div>
                    </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-lg font-semibold">{appointment.appointment_time}</p>
                        <div className="flex gap-1">
                          {appointment.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            >
                              Confirmar
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                            >
                              Iniciar
                            </Button>
                          )}
                          {appointment.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            >
                              Finalizar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/atendimento/${appointment.id}`}>
                              Atender
                            </Link>
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Week View */}
        {view === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização Semanal</CardTitle>
              <CardDescription>
                Agenda da semana de {currentDate.toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Visualização semanal em desenvolvimento</p>
                <p className="text-sm">Use a visualização diária por enquanto</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month View */}
        {view === 'month' && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização Mensal</CardTitle>
              <CardDescription>
                Agenda do mês de {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Visualização mensal em desenvolvimento</p>
                <p className="text-sm">Use a visualização diária por enquanto</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              consultas agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              consultas confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              consultas em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              consultas concluídas
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SecretariaAgenda;
