import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { 
  Calendar, 
  FileText, 
  DollarSign, 
  Package, 
  Activity,
  Users,
  BarChart3,
  Settings,
  Stethoscope,
  Building2,
  Shield,
  ChevronLeft,
  Menu,
  LogOut,
  UserCheck,
  ClipboardList,
  Receipt,
  Warehouse,
  TrendingUp,
  PlayCircle,
  FileBarChart,
  Key,
  Home
} from "lucide-react"
import { BRANDING } from "@/config/branding"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LogoutButton from "@/components/auth/LogoutButton"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Secretaria",
    url: "/secretaria",
    icon: UserCheck,
    description: "Check-in e agendamentos"
  },
  {
    title: "Atendimento",
    url: "/atendimento",
    icon: Stethoscope,
    description: "Prontuário eletrônico"
  },
  {
    title: "Agenda",
    url: "/agenda",
    icon: Calendar,
    description: "Agendamentos médicos"
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: Receipt,
    description: "TISS e faturamento"
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Warehouse,
    description: "Materiais e medicamentos"
  },
  {
    title: "Gestão de Pacientes",
    url: "/secretaria/pacientes",
    icon: ClipboardList,
    description: "Gerenciar pacientes e cadastros"
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: TrendingUp,
    description: "BI clínico e financeiro"
  },
  {
    title: "Demonstração",
    url: "/demo",
    icon: PlayCircle,
    description: "Teste todas as funcionalidades"
  },
]

const adminItems = [
  {
    title: "Licenças",
    url: "/licencas",
    icon: Key,
    description: "Controle de acessos"
  },
  {
    title: "Unidades",
    url: "/unidades",
    icon: Building2,
    description: "Gestão de clínicas"
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    description: "Configurações do sistema"
  },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    
    // Define parent-child relationships to avoid double highlighting
    const parentChildRoutes = {
      "/secretaria": ["/secretaria/pacientes", "/secretaria/agenda", "/secretaria/checkin", "/secretaria/agendamentos", "/secretaria/cadastro-paciente"],
      "/financeiro": ["/financeiro/faturamento", "/financeiro/contas", "/financeiro/relatorios"],
      "/estoque": ["/estoque/materiais", "/estoque/medicamentos", "/estoque/baixa"],
      "/procedimentos": ["/procedimentos/fichas", "/procedimentos/realizados"],
      "/relatorios": ["/relatorios/clinicos", "/relatorios/financeiros", "/relatorios/exportar"],
      "/admin": ["/admin/licencas", "/admin/usuarios", "/admin/comercial"]
    }
    
    // Check if current path is a child of this path
    for (const [parent, children] of Object.entries(parentChildRoutes)) {
      if (path === parent && children.some(child => currentPath.startsWith(child))) {
        return false // Don't highlight parent if we're on a child route
      }
    }
    
    return currentPath.startsWith(path)
  }

  const getNavClassName = (path: string) => cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm",
    "hover:scale-[1.02] hover:border-l-4 hover:border-l-primary/30",
    isActive(path) 
      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg border-l-4 border-l-primary-foreground/50 scale-[1.02]" 
      : "text-muted-foreground hover:text-foreground"
  )

  // Logout functionality is now handled by LogoutButton component

  return (
    <Sidebar className={cn(
      "medical-sidebar border-r-2 bg-gradient-to-b from-card to-card/95 shadow-xl transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-center">
          {!collapsed ? (
            <div className="flex items-center gap-4 w-full">
              <img 
                src={BRANDING.assets.sublogo} 
                alt={BRANDING.name}
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-primary tracking-tight">{BRANDING.name}</h1>
                <p className="text-xs text-muted-foreground font-medium">{BRANDING.slogan}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
              <img 
                src={BRANDING.assets.sublogo} 
                alt={BRANDING.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Stethoscope className="w-5 h-5 text-white drop-shadow-sm hidden" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("transition-all duration-300", collapsed ? "p-2 space-y-2" : "p-4 space-y-6")}>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-bold text-primary/80 mb-3 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              MÓDULOS PRINCIPAIS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("transition-all duration-300", collapsed ? "space-y-1" : "space-y-1")}>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "transition-all duration-300",
                    collapsed ? "h-10 px-2 py-2 justify-center" : "h-12 px-3 py-2"
                  )}>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={collapsed ? item.title : item.description}
                      onClick={() => console.log(`Sidebar navigation clicked: ${item.url}`)}
                    >
                      <item.icon className={cn(
                        "shrink-0 group-hover:scale-110 transition-transform duration-200",
                        collapsed ? "w-6 h-6" : "w-5 h-5"
                      )} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0 ml-3">
                          <span className="font-semibold text-sm leading-tight block">{item.title}</span>
                          <p className="text-xs text-muted-foreground/70 truncate mt-1 leading-tight">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-bold text-primary/80 mb-3 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              ADMINISTRAÇÃO
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("transition-all duration-300", collapsed ? "space-y-1" : "space-y-1")}>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "transition-all duration-300",
                    collapsed ? "h-10 px-2 py-2 justify-center" : "h-12 px-3 py-2"
                  )}>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={collapsed ? item.title : item.description}
                      onClick={() => console.log(`Admin sidebar navigation clicked: ${item.url}`)}
                    >
                      <item.icon className={cn(
                        "shrink-0 group-hover:scale-110 transition-transform duration-200",
                        collapsed ? "w-6 h-6" : "w-5 h-5"
                      )} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0 ml-3">
                          <span className="font-semibold text-sm leading-tight block">{item.title}</span>
                          <p className="text-xs text-muted-foreground/70 truncate mt-1 leading-tight">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn(
        "border-t border-border/50 bg-gradient-to-r from-muted/30 to-transparent transition-all duration-300",
        collapsed ? "p-2 space-y-1" : "p-4 space-y-2"
      )}>
        {/* Logout Button */}
        <LogoutButton
          variant="ghost"
          size="sm"
          className={cn(
            "w-full rounded-xl transition-all duration-300",
            collapsed ? "justify-center py-2" : "justify-start py-3"
          )}
          showIcon={true}
          showText={!collapsed}
        />
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 rounded-xl",
            collapsed ? "justify-center py-2" : "justify-between py-3"
          )}
        >
          {!collapsed && <span className="font-medium">Recolher menu</span>}
          <ChevronLeft className={cn(
            "w-4 h-4 transition-all duration-300",
            collapsed && "rotate-180"
          )} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}