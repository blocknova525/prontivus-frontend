import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/lib/api"
import { useState, useEffect } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { BRANDING } from "@/config/branding"

interface AppHeaderProps {
  title?: string
  subtitle?: string
}

export function AppHeader({ title = "Dashboard", subtitle }: AppHeaderProps) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{ [key: string]: boolean }>({});
  const { unreadCount, notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // Determine which API method to use based on stored user type
      const userType = localStorage.getItem('user_type') || 'staff';
      const userData = userType === 'patient' 
        ? await apiService.getCurrentPatient()
        : await apiService.getCurrentUser();
      setUserInfo(userData);
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = (user: any) => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Usuário';
  };

  const getUserRole = (user: any) => {
    if (user?.crm) {
      return `CRM: ${user.crm}`;
    }
    if (user?.user_role === 'admin') {
      return 'Administrador';
    }
    if (user?.user_role === 'secretary') {
      return 'Secretária';
    }
    if (user?.user_role === 'patient') {
      return 'Paciente';
    }
    return '';
  };

  return (
    <header className="medical-header sticky top-0 z-50 w-full">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <img 
            src={BRANDING.assets.sublogo} 
            alt={BRANDING.name}
            className="h-16 w-auto hidden md:block"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes, procedimentos..."
              className="pl-10 w-64 bg-muted/50 border-border focus:bg-background"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-medical-red hover:bg-medical-red">
                    {unreadCount}
                </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.type === 'warning' ? 'bg-medical-amber-soft border-medical-amber/20' :
                        notification.type === 'info' ? 'bg-primary-soft border-primary/20' :
                        notification.type === 'success' ? 'bg-medical-green-soft border-medical-green/20' :
                        'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={buttonLoading[`read-${notification.id}`]}
                              onClick={async () => {
                                setButtonLoading(prev => ({ ...prev, [`read-${notification.id}`]: true }));
                                try {
                                  await markAsRead(notification.id);
                                  console.log('Notification marked as read:', notification.id);
                                } catch (error) {
                                  console.error('Error marking notification as read:', error);
                                } finally {
                                  setButtonLoading(prev => ({ ...prev, [`read-${notification.id}`]: false }));
                                }
                              }}
                              className="h-6 w-6 p-0 text-xs hover:bg-green-100 disabled:opacity-50"
                              title="Marcar como lida"
                            >
                              {buttonLoading[`read-${notification.id}`] ? '...' : '✓'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={buttonLoading[`delete-${notification.id}`]}
                            onClick={async () => {
                              setButtonLoading(prev => ({ ...prev, [`delete-${notification.id}`]: true }));
                              try {
                                await removeNotification(notification.id);
                                console.log('Notification removed:', notification.id);
                              } catch (error) {
                                console.error('Error removing notification:', error);
                              } finally {
                                setButtonLoading(prev => ({ ...prev, [`delete-${notification.id}`]: false }));
                              }
                            }}
                            className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-red-100 disabled:opacity-50"
                            title="Remover notificação"
                          >
                            {buttonLoading[`delete-${notification.id}`] ? '...' : '×'}
                          </Button>
                        </div>
                </div>
                </div>
                  ))
                )}
                {notifications.length > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={buttonLoading['markAll']}
                      onClick={async () => {
                        setButtonLoading(prev => ({ ...prev, 'markAll': true }));
                        try {
                          await markAllAsRead();
                          console.log('All notifications marked as read');
                        } catch (error) {
                          console.error('Error marking all notifications as read:', error);
                        } finally {
                          setButtonLoading(prev => ({ ...prev, 'markAll': false }));
                        }
                      }}
                      className="text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      {buttonLoading['markAll'] ? 'Processando...' : 'Marcar todas como lidas'}
                    </Button>
                    {notifications.length > 5 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('View all notifications clicked');
                          // TODO: Navigate to full notifications page
                        }}
                        className="text-primary hover:bg-primary/10"
                      >
                        Ver todas ({notifications.length})
                      </Button>
                    )}
                </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userInfo?.avatar_url || "/api/placeholder/40/40"} alt={getUserDisplayName(userInfo)} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {loading ? '...' : getUserInitials(getUserDisplayName(userInfo))}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {loading ? 'Carregando...' : getUserDisplayName(userInfo)}
                  </p>
                  {userInfo?.crm && (
                    <p className="text-xs text-muted-foreground">
                      CRM: {userInfo.crm}
                    </p>
                  )}
                  {userInfo?.email && (
                    <p className="text-xs text-muted-foreground">
                      {userInfo.email}
                    </p>
                  )}
                  {!userInfo?.crm && userInfo?.user_role && (
                    <p className="text-xs text-muted-foreground">
                      {getUserRole(userInfo)}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}