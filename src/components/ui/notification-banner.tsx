import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock,
  User,
  Calendar,
  Activity
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: "appointment" | "patient" | "system" | "financial"
}

interface NotificationBannerProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Estoque Baixo",
    message: "Dipirona 500mg está com estoque baixo (8 unidades restantes)",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    category: "system"
  },
  {
    id: "2",
    type: "info",
    title: "Nova Consulta",
    message: "Maria Santos Silva agendou uma consulta para amanhã às 14:00",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    category: "appointment"
  },
  {
    id: "3",
    type: "success",
    title: "Pagamento Recebido",
    message: "Pagamento de R$ 150,00 recebido de Carlos Eduardo",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    category: "financial"
  },
  {
    id: "4",
    type: "error",
    title: "Sistema TISS Offline",
    message: "Conexão com Amil temporariamente indisponível",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    category: "system"
  }
]

const getNotificationIcon = (type: string, category: string) => {
  if (category === "appointment") return <Calendar className="w-4 h-4" />
  if (category === "patient") return <User className="w-4 h-4" />
  if (category === "financial") return <Activity className="w-4 h-4" />
  
  switch (type) {
    case "success":
      return <CheckCircle className="w-4 h-4" />
    case "warning":
      return <AlertTriangle className="w-4 h-4" />
    case "error":
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-medical-green bg-medical-green-soft border-medical-green/20"
    case "warning":
      return "text-medical-amber bg-medical-amber-soft border-medical-amber/20"
    case "error":
      return "text-medical-red bg-medical-red-soft border-medical-red/20"
    default:
      return "text-primary bg-primary-soft border-primary/20"
  }
}

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h atrás`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} dias atrás`
  }
}

export function NotificationBanner({ 
  notifications = mockNotifications, 
  onMarkAsRead, 
  onDismiss 
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter(n => !n.read).length
  )

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  if (!isVisible || notifications.length === 0) {
    return null
  }

  const unreadNotifications = notifications.filter(n => !n.read)

  return (
    <Card className="medical-card border-l-4 border-l-primary mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Badge className="medical-status-pending">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {unreadNotifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type, notification.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss?.(notification.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
          
          {unreadNotifications.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                Ver todas as notificações ({unreadNotifications.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
