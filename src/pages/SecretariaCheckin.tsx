import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  UserPlus,
  FileText,
  Stethoscope
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const SecretariaCheckin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  // Mock data
  const waitingPatients = [
    { 
      id: 1, 
      name: 'Ana Costa', 
      cpf: '123.456.789-01', 
      appointmentTime: '09:00', 
      doctor: 'Dr. João Silva',
      status: 'waiting',
      priority: 'normal',
      insurance: 'Unimed',
      checkInTime: '08:45'
    },
    { 
      id: 2, 
      name: 'Pedro Oliveira', 
      cpf: '987.654.321-02', 
      appointmentTime: '10:30', 
      doctor: 'Dra. Maria Santos',
      status: 'checked_in',
      priority: 'high',
      insurance: 'Bradesco Saúde',
      checkInTime: '10:15'
    },
    { 
      id: 3, 
      name: 'Mariana Lima', 
      cpf: '456.789.123-03', 
      appointmentTime: '14:00', 
      doctor: 'Dr. Carlos Oliveira',
      status: 'in_consultation',
      priority: 'normal',
      insurance: 'SulAmérica',
      checkInTime: '13:45'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'in_consultation': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'checked_in': return 'Check-in Realizado';
      case 'in_consultation': return 'Em Consulta';
      case 'completed': return 'Finalizada';
      default: return 'Pendente';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCheckIn = (patientId: number) => {
    // Mock check-in action
    console.log('Check-in realizado para paciente:', patientId);
    setSelectedPatient(patientId);
  };

  const handleStartConsultation = (patientId: number) => {
    // Mock start consultation action
    console.log('Iniciando consulta para paciente:', patientId);
  };

  const filteredPatients = waitingPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  return (
    <AppLayout 
      title="Check-in e Fila" 
      subtitle="Gerenciamento da fila de pacientes e check-in"
    >
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Check-in e Fila</h2>
          <p className="text-muted-foreground">
            Gerenciamento da fila de pacientes e check-in
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Check-in
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Buscar Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou CPF do paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total na Fila</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              pacientes aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15min</div>
            <p className="text-xs text-muted-foreground">
              tempo de espera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Fila de Pacientes
            </CardTitle>
            <CardDescription>
              Pacientes aguardando atendimento - {new Date().toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                      <p className="text-sm text-muted-foreground">
                        Consulta: {patient.appointmentTime} - {patient.doctor}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Convênio: {patient.insurance}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">Check-in: {patient.checkInTime}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(patient.status)}>
                          {getStatusText(patient.status)}
                        </Badge>
                        <Badge className={getPriorityColor(patient.priority)}>
                          {patient.priority === 'high' ? 'Alta' : 
                           patient.priority === 'medium' ? 'Média' : 'Normal'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {patient.status === 'waiting' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(patient.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Check-in
                        </Button>
                      )}
                      
                      {patient.status === 'checked_in' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartConsultation(patient.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Stethoscope className="w-4 h-4 mr-1" />
                          Iniciar Consulta
                        </Button>
                      )}
                      
                      {patient.status === 'in_consultation' && (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="w-4 h-4 mr-1" />
                          Em Andamento
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum paciente encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Verificar Convênio
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Paciente
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Relatório de Atrasos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status da Fila</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Aguardando:</span>
                  <span className="font-medium">
                    {waitingPatients.filter(p => p.status === 'waiting').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Check-in Realizado:</span>
                  <span className="font-medium">
                    {waitingPatients.filter(p => p.status === 'checked_in').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Em Consulta:</span>
                  <span className="font-medium">
                    {waitingPatients.filter(p => p.status === 'in_consultation').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Próximas Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {waitingPatients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex justify-between text-sm">
                    <span className="truncate">{patient.name}</span>
                    <span className="font-medium">{patient.appointmentTime}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SecretariaCheckin;
