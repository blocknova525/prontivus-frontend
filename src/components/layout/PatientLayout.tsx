import { ReactNode } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Calendar, 
  FileText, 
  User,
  Activity,
  LogOut,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BRANDING } from "@/config/branding"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface PatientLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const patientNavigationItems = [
  {
    title: "Dashboard",
    url: "/patient/dashboard",
    icon: Activity,
    description: "Visão geral"
  },
  {
    title: "Agendamentos",
    url: "/patient/appointments", 
    icon: Calendar,
    description: "Meus agendamentos"
  },
  {
    title: "Prontuário",
    url: "/patient/medical-records",
    icon: FileText,
    description: "Histórico médico"
  },
  {
    title: "Receitas",
    url: "/patient/prescriptions",
    icon: FileText,
    description: "Prescrições médicas"
  },
  {
    title: "Perfil",
    url: "/patient/profile",
    icon: User,
    description: "Meus dados"
  }
]

export function PatientLayout({ children, title = "Portal do Paciente", subtitle }: PatientLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Consulta Confirmada",
      message: "Sua consulta com Dr. João Silva foi confirmada para 25/09/2025 às 15:00",
      time: "2 horas atrás",
      read: false,
      type: "appointment"
    },
    {
      id: 2,
      title: "Receita Disponível",
      message: "Nova receita médica disponível para download",
      time: "1 dia atrás",
      read: false,
      type: "prescription"
    },
    {
      id: 3,
      title: "Lembrete de Medicamento",
      message: "Não esqueça de tomar sua medicação às 8h",
      time: "2 dias atrás",
      read: true,
      type: "reminder"
    }
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const getNavClassName = (url: string) => {
    const isActive = location.pathname === url || location.pathname.startsWith(url + '/')
    return cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
      "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:text-primary hover:shadow-sm",
      isActive 
        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25" 
        : "text-slate-600 hover:text-slate-900"
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
    localStorage.removeItem('user_role')
    window.location.href = '/login'
  }

  const handleNotificationClick = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const handleProfileClick = () => {
    window.location.href = '/patient/profile'
  }

  const handleSettingsClick = () => {
    window.location.href = '/patient/profile'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Patient Sidebar */}
      <div className={cn(
        "w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shadow-xl",
        "lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={BRANDING.assets.sublogo} 
                  alt={BRANDING.name}
                  className="h-16 w-auto drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center hidden shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900 tracking-tight">{BRANDING.name}</h1>
                <p className="text-sm text-slate-500 font-medium">{BRANDING.slogan}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {patientNavigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={getNavClassName(item.url)}
                title={item.description}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  {location.pathname === item.url && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0 ml-3">
                  <span className="font-semibold text-sm leading-tight block">{item.title}</span>
                  <p className="text-xs opacity-70 truncate mt-1 leading-tight">
                    {item.description}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sair da Conta</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-slate-600 mt-1 font-medium">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative hover:bg-slate-100 transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              notification.read ? "bg-slate-300" : "bg-blue-500"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium",
                                notification.read ? "text-slate-600" : "text-slate-900"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleMarkAllAsRead} className="text-center">
                        Marcar todas como lidas
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled className="text-center text-slate-500">
                      Nenhuma notificação
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-2 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      Ana Costa
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    <span>Minha Conta</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
