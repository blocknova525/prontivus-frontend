import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  X, 
  Volume2, 
  VolumeX,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface CallNotificationData {
  id: string;
  patientId: number;
  patientName: string;
  patientNumber?: string;
  doctorName: string;
  callType: 'consultation' | 'follow_up' | 'emergency';
  priority: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

interface CallNotificationProps {
  notification: CallNotificationData;
  onAccept?: (notificationId: string) => void;
  onReject?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

const CallNotification: React.FC<CallNotificationProps> = ({
  notification,
  onAccept,
  onReject,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 10000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoDismissDelay / 1000);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoDismiss]);

  useEffect(() => {
    // Play notification sound
    if (isVisible) {
      setIsPlaying(true);
      // In a real implementation, you would play an actual sound
      setTimeout(() => setIsPlaying(false), 2000);
    }
  }, [isVisible]);

  const handleAccept = () => {
    onAccept?.(notification.id);
    setIsVisible(false);
    toast.success(`Chamada aceita para ${notification.patientName}`);
  };

  const handleReject = () => {
    onReject?.(notification.id);
    setIsVisible(false);
    toast.info(`Chamada rejeitada para ${notification.patientName}`);
  };

  const handleDismiss = () => {
    onDismiss?.(notification.id);
    setIsVisible(false);
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

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Users className="w-4 h-4" />;
      case 'follow_up':
        return <Clock className="w-4 h-4" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getCallTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'follow_up':
        return 'Retorno';
      case 'emergency':
        return 'Emergência';
      default:
        return 'Chamada';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className={`
      fixed top-4 right-4 z-50 w-80 shadow-2xl border-l-4
      ${notification.priority === 'high' ? 'border-l-red-500 bg-red-50' : ''}
      ${notification.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' : ''}
      ${notification.priority === 'low' ? 'border-l-green-500 bg-green-50' : ''}
      animate-in slide-in-from-right duration-300
    `}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {notification.patientName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">
                {notification.patientName}
              </h4>
              <Badge 
                variant="secondary" 
                className={`${getPriorityColor(notification.priority)} text-white text-xs`}
              >
                {notification.priority.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {getCallTypeIcon(notification.callType)}
              <span>{getCallTypeText(notification.callType)}</span>
              <span>•</span>
              <span>{notification.patientNumber}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Aceitar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <PhoneOff className="w-3 h-3 mr-1" />
                  Rejeitar
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {isPlaying && (
                  <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
                )}
                {autoDismiss && (
                  <div className="text-xs text-muted-foreground">
                    {timeRemaining}s
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallNotification;
