import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  MessageSquare,
  Calendar,
  Clock,
  User,
  Camera,
  CameraOff,
  Settings,
  Share,
  Download,
  Upload
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface TelemedicineSession {
  id: number;
  patient_name: string;
  patient_id: number;
  doctor_name: string;
  doctor_id: number;
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  session_url?: string;
  notes?: string;
}

interface ChatMessage {
  id: number;
  sender: 'doctor' | 'patient';
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
}

const Telemedicine = () => {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [activeSession, setActiveSession] = useState<TelemedicineSession | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTelemedicineData();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadTelemedicineData = async () => {
    try {
      setLoading(true);
      
      // Load telemedicine appointments from API
      const appointmentsResponse = await apiService.getAppointments({ 
        type: 'telemedicine',
        status: ['scheduled', 'active', 'completed', 'cancelled']
      });
      
      const telemedicineAppointments = appointmentsResponse || [];
      
      // Transform appointments to telemedicine sessions
      const sessionsData = telemedicineAppointments.map((apt: any) => ({
        id: apt.id,
        patient_name: apt.patient_name || 'Paciente',
        patient_id: apt.patient_id || 0,
        doctor_name: apt.doctor_name || 'Médico',
        doctor_id: apt.doctor_id || 0,
        scheduled_time: apt.appointment_date + 'T' + apt.appointment_time + ':00Z',
        duration: apt.duration || 30,
        status: apt.status || 'scheduled',
        session_url: apt.session_url || null,
        notes: apt.notes || null
      }));
      
      setSessions(sessionsData);

      // Mock chat messages for active session
      setChatMessages([
        {
          id: 1,
          sender: 'doctor',
          message: 'Olá Pedro, como você está se sentindo hoje?',
          timestamp: '2024-01-20T15:30:00Z',
          type: 'text'
        },
        {
          id: 2,
          sender: 'patient',
          message: 'Olá doutora, estou me sentindo melhor, mas ainda tenho algumas dores.',
          timestamp: '2024-01-20T15:31:00Z',
          type: 'text'
        },
        {
          id: 3,
          sender: 'doctor',
          message: 'Entendo. Pode me descrever melhor essas dores?',
          timestamp: '2024-01-20T15:32:00Z',
          type: 'text'
        }
      ]);
    } catch (err: any) {
      console.error('Error loading telemedicine data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados de telemedicina'));
      
      // Fallback to mock data
      setSessions([
        {
          id: 1,
          patient_name: 'Ana Costa',
          patient_id: 1,
          doctor_name: 'Dr. João Silva',
          doctor_id: 1,
          scheduled_time: '2024-01-20T14:00:00Z',
          duration: 30,
          status: 'scheduled',
          notes: 'Consulta de retorno'
        },
        {
          id: 2,
          patient_name: 'Pedro Oliveira',
          patient_id: 2,
          doctor_name: 'Dra. Maria Santos',
          doctor_id: 2,
          scheduled_time: '2024-01-20T15:30:00Z',
          duration: 45,
          status: 'active',
          session_url: 'https://meet.example.com/session-2'
        },
        {
          id: 3,
          patient_name: 'Mariana Lima',
          patient_id: 3,
          doctor_name: 'Dr. Carlos Oliveira',
          doctor_id: 3,
          scheduled_time: '2024-01-20T16:00:00Z',
          duration: 30,
          status: 'completed',
          notes: 'Consulta realizada com sucesso'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startSession = (session: TelemedicineSession) => {
    setActiveSession(session);
    // In a real implementation, this would start the video call
    // For now, we'll just simulate it
    console.log('Starting session:', session);
  };

  const endSession = () => {
    setActiveSession(null);
    setIsVideoOn(true);
    setIsAudioOn(true);
    setIsScreenSharing(false);
    setIsRecording(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'doctor', // In real app, this would be determined by current user
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'active': return 'Ativa';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando telemedicina...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar telemedicina</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadTelemedicineData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (activeSession) {
    return (
      <AppLayout>
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-white">
            <div>
              <h1 className="text-xl font-bold">Consulta Online</h1>
              <p className="text-sm text-gray-600">
                {activeSession.patient_name} - {activeSession.doctor_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(activeSession.status)}>
                {getStatusText(activeSession.status)}
              </Badge>
              <Button variant="outline" size="sm" onClick={endSession}>
                <PhoneOff className="w-4 h-4 mr-2" />
                Encerrar
              </Button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 flex flex-col">
              {/* Main Video */}
              <div className="flex-1 bg-black relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
                    <Button
                      size="sm"
                      variant={isVideoOn ? "default" : "destructive"}
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isAudioOn ? "default" : "destructive"}
                      onClick={toggleAudio}
                    >
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isScreenSharing ? "default" : "outline"}
                      onClick={toggleScreenShare}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={toggleRecording}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Patient Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                  <video className="w-full h-full object-cover" autoPlay muted />
                </div>
              </div>

              {/* Session Info */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Duração: 15:32</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">2 participantes</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Gravar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="w-80 border-l bg-white flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Chat da Consulta</h3>
              </div>
              
              <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.sender === 'doctor'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
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
            <h1 className="text-3xl font-bold">Telemedicina</h1>
            <p className="text-gray-600">Consultas online e atendimento remoto</p>
          </div>
          <Button>
            <Video className="w-4 h-4 mr-2" />
            Nova Consulta Online
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +2 em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Em andamento agora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32min</div>
              <p className="text-xs text-muted-foreground">
                Duração média das consultas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Avaliação média dos pacientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões de Telemedicina</CardTitle>
            <CardDescription>
              Gerencie as consultas online agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{session.patient_name}</h3>
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusText(session.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{session.doctor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(session.scheduled_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} minutos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Consulta Online</span>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Observações:</strong> {session.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {session.status === 'scheduled' && (
                      <Button size="sm" onClick={() => startSession(session)}>
                        <Video className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button size="sm" onClick={() => startSession(session)}>
                        <Users className="w-4 h-4 mr-2" />
                        Entrar
                      </Button>
                    )}
                    {session.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Relatório
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Telemedicine;
