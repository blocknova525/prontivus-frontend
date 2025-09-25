import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Clock, 
  Users, 
  Volume2, 
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  X
} from 'lucide-react';
import { toast } from 'sonner';

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

interface CallDisplayProps {
  className?: string;
  showControls?: boolean;
}

const CallDisplay: React.FC<CallDisplayProps> = ({ 
  className, 
  showControls = true 
}) => {
  const [activeCalls, setActiveCalls] = useState<CallInfo[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [volume, setVolume] = useState(80);

  // Mock data for demonstration
  useEffect(() => {
    const mockCalls: CallInfo[] = [
      {
        id: '1',
        patientId: 1,
        patientName: 'Maria Santos Silva',
        patientNumber: '(11) 99999-9999',
        doctorId: 1,
        doctorName: 'Dr. João Silva',
        status: 'connected',
        initiatedAt: new Date(Date.now() - 120000), // 2 minutes ago
        duration: 120,
        callType: 'consultation'
      },
      {
        id: '2',
        patientId: 2,
        patientName: 'João Oliveira',
        patientNumber: '(11) 88888-8888',
        doctorId: 1,
        doctorName: 'Dr. João Silva',
        status: 'ringing',
        initiatedAt: new Date(),
        callType: 'follow_up'
      }
    ];

    setActiveCalls(mockCalls);

    // Simulate call updates
    const interval = setInterval(() => {
      setActiveCalls(prev => 
        prev.map(call => 
          call.status === 'connected' 
            ? { ...call, duration: (call.duration || 0) + 1 }
            : call
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ringing':
        return 'bg-yellow-500';
      case 'connected':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ringing':
        return 'Chamando';
      case 'connected':
        return 'Conectado';
      case 'ended':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Users className="w-4 h-4" />;
      case 'follow_up':
        return <Clock className="w-4 h-4" />;
      case 'emergency':
        return <Phone className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const handleEndCall = (callId: string) => {
    setActiveCalls(prev => 
      prev.map(call => 
        call.id === callId 
          ? { ...call, status: 'ended' as const }
          : call
      )
    );
    toast.success('Chamada finalizada');
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Microfone ativado' : 'Microfone desativado');
  };

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
    toast.info(isVideoOn ? 'Vídeo desativado' : 'Vídeo ativado');
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleSendMessage = (patientId: number) => {
    toast.info('Enviando mensagem para o paciente...');
  };

  if (activeCalls.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Phone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhuma chamada ativa</p>
          <p className="text-sm text-muted-foreground">As chamadas aparecerão aqui quando iniciadas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activeCalls.map((call) => (
        <Card key={call.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {call.patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{call.patientName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getCallTypeIcon(call.callType)}
                    <span>{call.patientNumber}</span>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(call.status)} text-white`}
                    >
                      {getStatusText(call.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {call.status === 'connected' && call.duration && (
                  <div className="text-right">
                    <div className="text-sm font-mono">{formatDuration(call.duration)}</div>
                    <div className="text-xs text-muted-foreground">Duração</div>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEndCall(call.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {call.status === 'connected' && showControls && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "outline"}
                    onClick={handleMuteToggle}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={isVideoOn ? "default" : "outline"}
                    onClick={handleVideoToggle}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendMessage(call.patientId)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-20"
                    aria-label="Controle de volume"
                    title={`Volume: ${volume}%`}
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CallDisplay;
