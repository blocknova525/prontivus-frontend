import { AppLayout } from "@/components/layout/AppLayout"
import { WelcomeBanner } from "@/components/medical/WelcomeBanner"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { AppointmentsToday } from "@/components/dashboard/AppointmentsToday"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { useMedicalData } from "@/hooks/useMedicalData"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

const Index = () => {
  const { getStatistics } = useMedicalData()
  const stats = getStatistics()

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle="Bem-vindo ao CliniCore - Visão geral da sua clínica"
    >
      <div className="space-y-6">
        {/* Notifications */}
        <NotificationBanner />
        
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Key Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pacientes Ativos"
            value={stats.totalPatients.toLocaleString()}
            change="+12%"
            changeType="positive"
            icon={Users}
            description="vs. mês anterior"
          />
          <StatsCard
            title="Consultas Hoje"
            value={stats.todayAppointments.toString()}
            change="+3"
            changeType="positive"
            icon={Calendar}
            description="agendadas para hoje"
          />
          <StatsCard
            title="Receita Mensal"
            value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+8.2%"
            changeType="positive"
            icon={DollarSign}
            description="vs. mês anterior"
          />
          <StatsCard
            title="Taxa de Ocupação"
            value="87%"
            change="+5%"
            changeType="positive"
            icon={TrendingUp}
            description="eficiência média"
          />
        </div>

        {/* Medical Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            title="Consultas Finalizadas"
            value="18"
            change="75%"
            changeType="positive"
            icon={CheckCircle}
            description="das consultas de hoje"
          />
          <StatsCard
            title="Aguardando Atendimento"
            value="6"
            change="25%"
            changeType="neutral"
            icon={Clock}
            description="pacientes na fila"
          />
          <StatsCard
            title="Telemedicina Online"
            value="3"
            change="Ativo"
            changeType="positive"
            icon={Activity}
            description="consultas remotas"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Takes 2/3 of space */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />
            <AppointmentsToday />
          </div>
          
          {/* Right Column - Takes 1/3 of space */}
          <div className="space-y-6">
            <RecentActivity />
            
            {/* License Status Card */}
            <div className="medical-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-medical-green/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-medical-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Status da Licença</h3>
                  <p className="text-sm text-muted-foreground">CliniCore Pro</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Validade:</span>
                  <span className="font-medium text-foreground">30/11/2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usuários:</span>
                  <span className="font-medium text-foreground">12 / 50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Módulos:</span>
                  <span className="font-medium text-medical-green">Todos ativos</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-medical-green h-2 rounded-full w-[24%]"></div>
                </div>
                <p className="text-xs text-muted-foreground">24% da capacidade utilizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
