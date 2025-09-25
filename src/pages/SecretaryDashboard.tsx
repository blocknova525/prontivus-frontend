import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Users, Clock, CheckCircle, AlertCircle, FileText, Stethoscope } from 'lucide-react';
import { apiService } from '@/lib/api';

interface PatientCheckIn {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_cpf: string;
  patient_phone: string;
  check_in_time: string;
  status: 'arrived' | 'waiting' | 'called' | 'in_consultation' | 'completed' | 'no_show' | 'cancelled';
  priority_level: number;
  arrival_method: string;
  notes: string;
  insurance_verified: boolean;
  estimated_wait_time: number;
  secretary_name: string;
}

interface CheckInStats {
  total_checkins: number;
  waiting: number;
  in_consultation: number;
  completed: number;
  cancelled: number;
  no_show: number;
  average_wait_time: number;
}

const SecretaryDashboard: React.FC = () => {
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    total_checkins: 0,
    waiting: 0,
    in_consultation: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    average_wait_time: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientCheckIn | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showExamDialog, setShowExamDialog] = useState(false);

  // Check-in form state
  const [checkInForm, setCheckInForm] = useState({
    patient_id: '',
    appointment_id: '',
    arrival_method: 'appointment',
    priority_level: 2,
    notes: ''
  });

  useEffect(() => {
    loadCheckIns();
    loadStats();
  }, []);

  const loadCheckIns = async () => {
    try {
      const response = await apiService.get('/api/v1/secretary/check-ins');
      setCheckIns(response.data);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from check-ins
      const total = checkIns.length;
      const waiting = checkIns.filter(c => c.status === 'waiting').length;
      const inConsultation = checkIns.filter(c => c.status === 'in_consultation').length;
      const completed = checkIns.filter(c => c.status === 'completed').length;
      const cancelled = checkIns.filter(c => c.status === 'cancelled').length;
      const noShow = checkIns.filter(c => c.status === 'no_show').length;
      
      setStats({
        total_checkins: total,
        waiting,
        in_consultation: inConsultation,
        completed,
        cancelled,
        no_show: noShow,
        average_wait_time: 15 // Mock data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiService.post('/api/v1/secretary/check-in', checkInForm);
      setShowCheckInDialog(false);
      setCheckInForm({
        patient_id: '',
        appointment_id: '',
        arrival_method: 'appointment',
        priority_level: 2,
        notes: ''
      });
      loadCheckIns();
    } catch (error) {
      console.error('Error checking in patient:', error);
    }
  };

  const updateCheckInStatus = async (checkInId: number, status: string) => {
    try {
      await apiService.put(`/api/v1/secretary/check-in/${checkInId}/status`, { status });
      loadCheckIns();
    } catch (error) {
      console.error('Error updating check-in status:', error);
    }
  };

  const verifyInsurance = async (checkInId: number) => {
    try {
      await apiService.post(`/api/v1/secretary/insurance/verify/${checkInId}`);
      loadCheckIns();
    } catch (error) {
      console.error('Error verifying insurance:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      arrived: { color: 'bg-blue-100 text-blue-800', label: 'Chegou' },
      waiting: { color: 'bg-yellow-100 text-yellow-800', label: 'Aguardando' },
      called: { color: 'bg-orange-100 text-orange-800', label: 'Chamado' },
      in_consultation: { color: 'bg-purple-100 text-purple-800', label: 'Em Consulta' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      no_show: { color: 'bg-red-100 text-red-800', label: 'Não Compareceu' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.arrived;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (level: number) => {
    const priorityConfig = {
      1: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
      2: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      3: { color: 'bg-yellow-100 text-yellow-800', label: 'Alta' },
      4: { color: 'bg-orange-100 text-orange-800', label: 'Urgente' },
      5: { color: 'bg-red-100 text-red-800', label: 'Emergência' }
    };
    
    const config = priorityConfig[level as keyof typeof priorityConfig] || priorityConfig[2];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel da Secretária</h1>
        <div className="flex gap-2">
          <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
            <DialogTrigger asChild>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Check-in Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check-in de Paciente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient_id">ID do Paciente</Label>
                  <Input
                    id="patient_id"
                    value={checkInForm.patient_id}
                    onChange={(e) => setCheckInForm({ ...checkInForm, patient_id: e.target.value })}
                    placeholder="Digite o ID do paciente"
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_id">ID da Consulta (opcional)</Label>
                  <Input
                    id="appointment_id"
                    value={checkInForm.appointment_id}
                    onChange={(e) => setCheckInForm({ ...checkInForm, appointment_id: e.target.value })}
                    placeholder="Digite o ID da consulta"
                  />
                </div>
                <div>
                  <Label htmlFor="arrival_method">Método de Chegada</Label>
                  <Select
                    value={checkInForm.arrival_method}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, arrival_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Consulta Agendada</SelectItem>
                      <SelectItem value="walk_in">Chegada Espontânea</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                      <SelectItem value="referral">Encaminhamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority_level">Nível de Prioridade</Label>
                  <Select
                    value={checkInForm.priority_level.toString()}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, priority_level: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Baixa</SelectItem>
                      <SelectItem value="2">Normal</SelectItem>
                      <SelectItem value="3">Alta</SelectItem>
                      <SelectItem value="4">Urgente</SelectItem>
                      <SelectItem value="5">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                    placeholder="Observações sobre o paciente"
                  />
                </div>
                <Button onClick={handleCheckIn} className="w-full">
                  Fazer Check-in
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_checkins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Consulta</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_consultation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="waiting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waiting">Painel de Espera</TabsTrigger>
          <TabsTrigger value="all">Todos os Check-ins</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="exams">Exames</TabsTrigger>
        </TabsList>

        <TabsContent value="waiting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes Aguardando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkIns
                  .filter(checkIn => checkIn.status === 'waiting' || checkIn.status === 'called')
                  .map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{checkIn.patient_name}</h3>
                          <p className="text-sm text-gray-600">CPF: {checkIn.patient_cpf}</p>
                          <p className="text-sm text-gray-600">Telefone: {checkIn.patient_phone}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(checkIn.status)}
                          {getPriorityBadge(checkIn.priority_level)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Chegou: {new Date(checkIn.check_in_time).toLocaleTimeString()}
                          </p>
                          {checkIn.estimated_wait_time && (
                            <p className="text-sm text-gray-600">
                              Tempo estimado: {checkIn.estimated_wait_time} min
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {!checkIn.insurance_verified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyInsurance(checkIn.id)}
                            >
                              Verificar Convênio
                            </Button>
                          )}
                          {checkIn.status === 'waiting' && (
                            <Button
                              size="sm"
                              onClick={() => updateCheckInStatus(checkIn.id, 'called')}
                            >
                              Chamar Paciente
                            </Button>
                          )}
                          {checkIn.status === 'called' && (
                            <Button
                              size="sm"
                              onClick={() => updateCheckInStatus(checkIn.id, 'in_consultation')}
                            >
                              Iniciar Consulta
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{checkIn.patient_name}</h3>
                        <p className="text-sm text-gray-600">CPF: {checkIn.patient_cpf}</p>
                        <p className="text-sm text-gray-600">
                          Chegou: {new Date(checkIn.check_in_time).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(checkIn.status)}
                        {getPriorityBadge(checkIn.priority_level)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Secretária: {checkIn.secretary_name}
                        </p>
                        {checkIn.insurance_verified ? (
                          <Badge className="bg-green-100 text-green-800">Convênio OK</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Convênio Pendente</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Funcionalidade de documentos em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exames</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Funcionalidade de exames em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecretaryDashboard;
