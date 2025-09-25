import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  doctor_id: number;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
}

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface Doctor {
  id: number;
  full_name: string;
  specialty: string;
  crm: string;
}

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state for new appointment
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'Consulta',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real data from API
      const [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
        apiService.getAppointments(),
        apiService.getPatients(),
        apiService.getUsers({ role: 'doctor' })
      ]);

      // Process appointments data
      const appointmentsData = appointmentsResponse || [];
      setAppointments(appointmentsData.map((apt: any) => ({
        id: apt.id,
        patient_id: apt.patient_id,
        patient_name: apt.patient?.full_name || apt.patient_name || 'Paciente não encontrado',
        patient_phone: apt.patient?.phone || apt.patient_phone || '',
        patient_email: apt.patient?.email || apt.patient_email || '',
        doctor_id: apt.doctor_id,
        doctor_name: apt.doctor?.full_name || apt.doctor_name || 'Médico não encontrado',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        type: apt.type || 'Consulta',
        status: apt.status || 'scheduled',
        notes: apt.notes || '',
        created_at: apt.created_at
      })));

      // Process patients data
      const patientsData = patientsResponse || [];
      setPatients(patientsData.map((patient: any) => ({
        id: patient.id,
        full_name: patient.full_name || patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        cpf: patient.cpf || ''
      })));

      // Process doctors data
      const doctorsData = doctorsResponse || [];
      setDoctors(doctorsData.map((doctor: any) => ({
        id: doctor.id,
        full_name: doctor.full_name,
        specialty: doctor.specialty || 'Clínica Geral',
        crm: doctor.crm || ''
      })));

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados'));
      
      // Fallback to empty data instead of mock data
      setAppointments([]);
      setPatients([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || appointment.doctor_id.toString() === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não Compareceu';
      default: return status;
    }
  };

  const handleCreateAppointment = async () => {
    try {
      // Create new appointment
      const newAppointment: Appointment = {
        id: appointments.length + 1,
        patient_id: parseInt(formData.patient_id),
        patient_name: patients.find(p => p.id === parseInt(formData.patient_id))?.full_name || '',
        patient_phone: patients.find(p => p.id === parseInt(formData.patient_id))?.phone || '',
        patient_email: patients.find(p => p.id === parseInt(formData.patient_id))?.email || '',
        doctor_id: parseInt(formData.doctor_id),
        doctor_name: doctors.find(d => d.id === parseInt(formData.doctor_id))?.full_name || '',
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        type: formData.type,
        status: 'scheduled',
        notes: formData.notes,
        created_at: new Date().toISOString()
      };

      setAppointments([...appointments, newAppointment]);
      setIsCreateDialogOpen(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        type: 'Consulta',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
    try {
      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus as any }
          : appointment
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
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
            <h1 className="text-3xl font-bold">Gestão de Agendamentos</h1>
            <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo agendamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.full_name} - {patient.cpf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Médico</Label>
                  <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.full_name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.appointment_date ? format(new Date(formData.appointment_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.appointment_date ? new Date(formData.appointment_date) : undefined}
                        onSelect={(date) => setFormData({...formData, appointment_date: date ? date.toISOString().split('T')[0] : ''})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Exame">Exame</SelectItem>
                      <SelectItem value="Procedimento">Procedimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAppointment}>
                  Criar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por paciente ou médico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">Não Compareceu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Médicos</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.map(appointment => (
            <Card key={appointment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{appointment.patient_name}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{appointment.doctor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{appointment.type}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.patient_phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{appointment.patient_email}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Observações:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select value={appointment.status} onValueChange={(value) => handleUpdateStatus(appointment.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Agendada</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">Não Compareceu</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAppointment(appointment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou criar um novo agendamento</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default AppointmentManagement;
