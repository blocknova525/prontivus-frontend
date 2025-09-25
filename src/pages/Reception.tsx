import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Users, 
  Clock, 
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import CallDisplay from '@/components/call/CallDisplay';
import CallNotification from '@/components/notifications/CallNotification';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface Patient {
  id: number;
  name: string;
  phone: string;
  appointmentTime: string;
  status: 'waiting' | 'in_consultation' | 'called' | 'completed';
  priority: 'low' | 'medium' | 'high';
  doctorName?: string;
}

interface CallInfo {
  id: string;
  patientId: number;
  patientName: string;
  patientNumber?: string;
  doctorId: number;
  doctorName: string;
  status: 'ringing' | 'connected' | 'ended';
  initiatedAt: Date;
  duration?: number;
  callType: 'consultation' | 'follow_up' | 'emergency';
}

const Reception = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeCalls, setActiveCalls] = useState<CallInfo[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('waiting-room');

  // Mock data for demonstration
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: 1,
        name: 'Maria Santos Silva',
        phone: '(11) 99999-9999',
        appointmentTime: '09:00',
        status: 'waiting',
        priority: 'medium'
      },
      {
        id: 2,
        name: 'João Oliveira',
        phone: '(11) 88888-8888',
        appointmentTime: '09:30',
        status: 'called',
        priority: 'high',
        doctorName: 'Dr. João Silva'
      },
      {
        id: 3,
        name: 'Ana Costa',
        phone: '(11) 77777-7777',
        appointmentTime: '10:00',
        status: 'in_consultation',
        priority: 'low',
        doctorName: 'Dr. Maria Santos'
      },
      {
        id: 4,
        name: 'Pedro Ferreira',
        phone: '(11) 66666-6666',
        appointmentTime: '10:30',
        status: 'waiting',
        priority: 'medium'
      }
    ];

    const mockCalls: CallInfo[] = [
      {
        id: '1',
        patientId: 2,
        patientName: 'João Oliveira',
        patientNumber: '(11) 88888-8888',
        doctorId: 1,
        doctorName: 'Dr. João Silva',
        status: 'connected',
        initiatedAt: new Date(Date.now() - 120000),
        duration: 120,
        callType: 'consultation'
      }
    ];

    setPatients(mockPatients);
    setActiveCalls(mockCalls);

    // Simulate new notifications
    const notificationInterval = setInterval(() => {
      const newNotification = {
        id: Date.now().toString(),
        patientId: Math.floor(Math.random() * 4) + 1,
        patientName: mockPatients[Math.floor(Math.random() * mockPatients.length)].name,
        patientNumber: '(11) 99999-9999',
        doctorName: 'Dr. João Silva',
        callType: 'consultation',
        priority: 'medium',
        message: 'Paciente aguardando na recepção',
        timestamp: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 30000); // Every 30 seconds

    return () => clearInterval(notificationInterval);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'called':
        return 'bg-blue-100 text-blue-800';
      case 'in_consultation':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'called':
        return 'Chamado';
      case 'in_consultation':
        return 'Em Consulta';
      case 'completed':
        return 'Finalizado';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch fresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados atualizados');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationAccept = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notificação aceita');
  };

  const handleNotificationReject = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.info('Notificação rejeitada');
  };

  const handleNotificationDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <AppLayout 
      title="Recepção" 
      subtitle="Sala de espera e gestão de chamadas"
    >
      <div className="space-y-6">
        {/* Notifications */}
        {notifications.map((notification) => (
          <CallNotification
            key={notification.id}
            notification={notification}
            onAccept={handleNotificationAccept}
            onReject={handleNotificationReject}
            onDismiss={handleNotificationDismiss}
          />
        ))}

        {/* Header Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pacientes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Pacientes na fila</div>
                  <div className="text-2xl font-bold text-primary">
                    {patients.filter(p => p.status === 'waiting').length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Chamadas ativas</div>
                  <div className="text-2xl font-bold text-green-600">
                    {activeCalls.filter(c => c.status === 'connected').length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waiting-room" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sala de Espera
            </TabsTrigger>
            <TabsTrigger value="active-calls" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Chamadas Ativas
            </TabsTrigger>
            <TabsTrigger value="call-history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Waiting Room Tab */}
          <TabsContent value="waiting-room" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Pacientes Aguardando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredPatients
                    .filter(patient => patient.status === 'waiting')
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{patient.phone}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{patient.appointmentTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getPriorityColor(patient.priority)} text-white`}
                        >
                          {patient.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {getStatusText(patient.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPatients.filter(p => p.status === 'waiting').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum paciente aguardando</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Calls Tab */}
          <TabsContent value="active-calls" className="space-y-4">
            <CallDisplay showControls={true} />
          </TabsContent>

          {/* Call History Tab */}
          <TabsContent value="call-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Histórico de Chamadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Histórico de chamadas em desenvolvimento</p>
                  <p className="text-sm">Em breve: registro completo de chamadas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reception;
