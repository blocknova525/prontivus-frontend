import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { extractErrorMessage } from '@/lib/utils'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: 'appointment' | 'patient' | 'system' | 'financial' | 'inventory' | 'license'
  actionUrl?: string
  actionLabel?: string
  persistent?: boolean
  autoHide?: boolean
  duration?: number
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

const STORAGE_KEY = 'clinicore-notifications'

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Estoque Baixo',
    message: 'Dipirona 500mg está com estoque baixo (8 unidades restantes)',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    category: 'inventory',
    actionUrl: '/estoque',
    actionLabel: 'Ver Estoque',
    persistent: true
  },
  {
    id: '2',
    type: 'info',
    title: 'Nova Consulta',
    message: 'Maria Santos Silva agendou uma consulta para amanhã às 14:00',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    category: 'appointment',
    actionUrl: '/agenda',
    actionLabel: 'Ver Agenda'
  },
  {
    id: '3',
    type: 'success',
    title: 'Pagamento Recebido',
    message: 'Pagamento de R$ 150,00 recebido de Carlos Eduardo',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    category: 'financial',
    actionUrl: '/financeiro',
    actionLabel: 'Ver Financeiro'
  },
  {
    id: '4',
    type: 'error',
    title: 'Sistema TISS Offline',
    message: 'Conexão com Amil temporariamente indisponível',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: false,
    category: 'system',
    persistent: true
  },
  {
    id: '5',
    type: 'info',
    title: 'Paciente Novo',
    message: 'Ana Lucia Costa foi cadastrada no sistema',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: false,
    category: 'patient',
    actionUrl: '/secretaria',
    actionLabel: 'Ver Pacientes'
  }
]

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true
  })

  // Load notifications from API
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const notificationsData = await apiService.getNotifications({ limit: 20 })
      const unreadCountData = await apiService.getUnreadCount()
      
      // Convert timestamp strings to Date objects
      const notifications = notificationsData.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))
      
      setState({
        notifications,
        unreadCount: unreadCountData.unread_count,
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to mock data if API fails
      setState({
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length,
        isLoading: false
      })
    }
  }

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }, [state.notifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }))

    // Auto-hide notification if specified
    if (notification.autoHide !== false) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, duration)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Try to call API first
      await apiService.markNotificationAsRead(id)
    } catch (error) {
      console.error('Error marking notification as read via API:', error)
      // Continue with local update even if API fails
    }
    
    // Always update local state
    setState(prev => {
      const updatedNotifications = prev.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }
    })
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      // Try to call API first
      await apiService.markAllNotificationsAsRead()
    } catch (error) {
      console.error('Error marking all notifications as read via API:', error)
      // Continue with local update even if API fails
    }
    
    // Always update local state
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }))
  }, [])

  const removeNotification = useCallback(async (id: string) => {
    try {
      // Try to call API first
      await apiService.deleteNotification(id)
    } catch (error) {
      console.error('Error deleting notification via API:', error)
      // Continue with local update even if API fails
    }
    
    // Always update local state
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === id)
      const updatedNotifications = prev.notifications.filter(n => n.id !== id)
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: notification?.read ? prev.unreadCount : prev.unreadCount - 1
      }
    })
  }, [])

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }))
  }, [])

  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return state.notifications.filter(n => n.category === category)
  }, [state.notifications])

  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.read)
  }, [state.notifications])

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return state.notifications.filter(n => n.timestamp > cutoff)
  }, [state.notifications])

  // Notification generators for common scenarios
  const notifyLowStock = useCallback((itemName: string, quantity: number) => {
    addNotification({
      type: 'warning',
      title: 'Estoque Baixo',
      message: `${itemName} está com estoque baixo (${quantity} unidades restantes)`,
      category: 'inventory',
      actionUrl: '/estoque',
      actionLabel: 'Ver Estoque',
      persistent: true
    })
  }, [addNotification])

  const notifyNewAppointment = useCallback((patientName: string, doctorName: string, date: Date) => {
    addNotification({
      type: 'info',
      title: 'Nova Consulta',
      message: `${patientName} agendou uma consulta com ${doctorName} para ${date.toLocaleDateString('pt-BR')}`,
      category: 'appointment',
      actionUrl: '/agenda',
      actionLabel: 'Ver Agenda'
    })
  }, [addNotification])

  const notifyPaymentReceived = useCallback((patientName: string, amount: number) => {
    addNotification({
      type: 'success',
      title: 'Pagamento Recebido',
      message: `Pagamento de R$ ${amount.toFixed(2)} recebido de ${patientName}`,
      category: 'financial',
      actionUrl: '/financeiro',
      actionLabel: 'Ver Financeiro'
    })
  }, [addNotification])

  const notifySystemError = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Erro do Sistema',
      message,
      category: 'system',
      persistent: true
    })
  }, [addNotification])

  const notifyNewPatient = useCallback((patientName: string) => {
    addNotification({
      type: 'info',
      title: 'Paciente Novo',
      message: `${patientName} foi cadastrado no sistema`,
      category: 'patient',
      actionUrl: '/secretaria',
      actionLabel: 'Ver Pacientes'
    })
  }, [addNotification])

  const notifyAppointmentReminder = useCallback((patientName: string, time: string) => {
    addNotification({
      type: 'info',
      title: 'Lembrete de Consulta',
      message: `Consulta com ${patientName} em ${time}`,
      category: 'appointment',
      actionUrl: '/agenda',
      actionLabel: 'Ver Agenda'
    })
  }, [addNotification])

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications (for demo purposes)
      const random = Math.random()
      
      if (random < 0.1) { // 10% chance every 30 seconds
        const notifications = [
          () => notifyNewAppointment('João Silva', 'Dr. Pedro Lima', new Date()),
          () => notifyPaymentReceived('Maria Santos', 200),
          () => notifyLowStock('Paracetamol 750mg', 5),
          () => notifyNewPatient('Carlos Mendes')
        ]
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        randomNotification()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [notifyNewAppointment, notifyPaymentReceived, notifyLowStock, notifyNewPatient])

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    loadNotifications,
    
    // Getters
    getNotificationsByCategory,
    getUnreadNotifications,
    getRecentNotifications,
    
    // Convenience methods
    notifyLowStock,
    notifyNewAppointment,
    notifyPaymentReceived,
    notifySystemError,
    notifyNewPatient,
    notifyAppointmentReminder
  }
}

// Toast notifications hook for temporary messages
export function useToastNotifications() {
  const [toasts, setToasts] = useState<Notification[]>([])

  const showToast = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'category'>) => {
    const toast: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      category: 'system',
      autoHide: true,
      duration: notification.duration || 3000
    }

    setToasts(prev => [...prev, toast])

    // Auto-remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, toast.duration || 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  }
}
