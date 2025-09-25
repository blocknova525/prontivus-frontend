import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

interface CallButtonProps {
  patientId: number;
  patientName: string;
  patientNumber?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const CallButton: React.FC<CallButtonProps> = ({
  patientId,
  patientName,
  patientNumber,
  className,
  variant = 'default',
  size = 'default'
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if ((window as any).callTimer) {
        clearInterval((window as any).callTimer);
        (window as any).callTimer = null;
      }
    };
  }, []);

  const handleCall = async () => {
    if (isCalling) {
      // End call
      await endCall();
      return;
    }

    try {
      setIsCalling(true);
      setCallStatus('calling');
      
      // Simulate call initiation
      const callData = {
        patient_id: patientId,
        patient_name: patientName,
        patient_number: patientNumber,
        doctor_id: 1, // This should come from current user context
        doctor_name: 'Dr. João Silva',
        call_type: 'consultation',
        status: 'initiated',
        initiated_at: new Date().toISOString()
      };

      // In a real implementation, this would initiate a WebSocket connection
      // or call a real telephony service
      console.log('Initiating call:', callData);
      
      // Simulate call connection after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
        startCallTimer();
        toast.success(`Chamada conectada com ${patientName}`);
      }, 2000);

      // Log call initiation
      try {
        await apiService.logPatientCall(callData);
      } catch (logError) {
        console.warn('Failed to log call initiation:', logError);
        // Don't fail the call if logging fails
      }
      
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Erro ao iniciar chamada');
      setIsCalling(false);
      setCallStatus('idle');
    }
  };

  const endCall = async () => {
    try {
      setIsCalling(false);
      setCallStatus('ended');
      
      // Clear the timer
      if ((window as any).callTimer) {
        clearInterval((window as any).callTimer);
        (window as any).callTimer = null;
      }
      
      // Log call end
      const endData = {
        patient_id: patientId,
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration: callDuration
      };

      try {
        await apiService.logPatientCall(endData);
      } catch (logError) {
        console.warn('Failed to log call end:', logError);
        // Don't fail the call end if logging fails
      }
      
      toast.success('Chamada finalizada');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCallStatus('idle');
        setCallDuration(0);
      }, 3000);
      
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Erro ao finalizar chamada');
    }
  };

  const startCallTimer = () => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Store timer reference for cleanup
    (window as any).callTimer = timer;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Conectando...';
      case 'connected':
        return `Chamada Ativa (${formatDuration(callDuration)})`;
      case 'ended':
        return 'Chamada Finalizada';
      default:
        return 'Chamar Paciente';
    }
  };

  const getButtonIcon = () => {
    switch (callStatus) {
      case 'calling':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <Phone className="w-4 h-4" />;
      case 'ended':
        return <PhoneOff className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getButtonVariant = () => {
    switch (callStatus) {
      case 'calling':
        return 'outline';
      case 'connected':
        return 'default';
      case 'ended':
        return 'secondary';
      default:
        return variant;
    }
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'calling':
        return <Badge variant="secondary" className="animate-pulse">Conectando</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Conectado</Badge>;
      case 'ended':
        return <Badge variant="outline">Finalizada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleCall}
        variant={getButtonVariant()}
        size={size}
        disabled={callStatus === 'ended'}
        className={`
          transition-all duration-200
          ${callStatus === 'connected' ? 'bg-green-600 hover:bg-green-700' : ''}
          ${callStatus === 'calling' ? 'animate-pulse' : ''}
        `}
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>
      
      {getStatusBadge()}
      
      {patientNumber && (
        <div className="text-xs text-muted-foreground">
          {patientNumber}
        </div>
      )}
    </div>
  );
};

export default CallButton;
