import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import BasicDashboard from "./pages/BasicDashboard";
import Secretaria from "./pages/Secretaria";
import SecretaryDashboard from "./pages/SecretaryDashboard";
import SecretariaAgenda from "./pages/SecretariaAgenda";
import SecretariaCheckin from "./pages/SecretariaCheckin";
import SecretariaPacientes from "./pages/SecretariaPacientes";
import FinancialDashboard from "./pages/FinancialDashboard";
import Atendimento from "./pages/Atendimento";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Estoque from "./pages/Estoque";
import Portal from "./pages/Portal";
import Relatorios from "./pages/Relatorios";
import Demo from "./pages/Demo";
import Licencas from "./pages/Licencas";
import Unidades from "./pages/Unidades";
import Configuracoes from "./pages/Configuracoes";
import NovoAgendamento from "./pages/NovoAgendamento";
import NovoPaciente from "./pages/NovoPaciente";
import NovaReceita from "./pages/NovaReceita";
import Faturamento from "./pages/Faturamento";
import Telemedicina from "./pages/Telemedicina";
import AppointmentManagement from "./pages/AppointmentManagement";
import PatientRegistration from "./pages/PatientRegistration";
import PatientApp from "./pages/PatientApp";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          // Opt-in to React Router v7 behavior early to avoid warnings
          v7_startTransition: true,        // Wrap state updates in React.startTransition
          v7_relativeSplatPath: true        // Change relative route resolution within Splat routes
        }}
      >
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register type="patient" />} />
          <Route path="/auth/register" element={<Register type="staff" />} />
          <Route path="/auth/register/patient" element={<Register type="patient" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected Pages - Dashboard */}
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/basic-dashboard" element={<AuthGuard><BasicDashboard /></AuthGuard>} />
          
          {/* Protected Pages - Secretaria (Staff Only) */}
          <Route path="/secretaria" element={<RoleGuard allowedUserTypes={['staff']}><Secretaria /></RoleGuard>} />
          <Route path="/secretaria/agenda" element={<RoleGuard allowedUserTypes={['staff']}><SecretariaAgenda /></RoleGuard>} />
          <Route path="/secretaria/checkin" element={<RoleGuard allowedUserTypes={['staff']}><SecretariaCheckin /></RoleGuard>} />
          <Route path="/secretaria/pacientes" element={<RoleGuard allowedUserTypes={['staff']}><SecretariaPacientes /></RoleGuard>} />
          <Route path="/secretaria/agendamentos" element={<RoleGuard allowedUserTypes={['staff']}><AppointmentManagement /></RoleGuard>} />
          <Route path="/secretaria/cadastro-paciente" element={<RoleGuard allowedUserTypes={['staff']}><PatientRegistration /></RoleGuard>} />
          <Route path="/secretary" element={<RoleGuard allowedUserTypes={['staff']}><SecretaryDashboard /></RoleGuard>} />
          
          {/* Protected Pages - Atendimento Médico (Staff Only) */}
          <Route path="/atendimento" element={<RoleGuard allowedUserTypes={['staff']}><Atendimento /></RoleGuard>} />
          <Route path="/atendimento/:id" element={<RoleGuard allowedUserTypes={['staff']}><Atendimento /></RoleGuard>} />
          <Route path="/atendimento/historico/:id" element={<RoleGuard allowedUserTypes={['staff']}><Atendimento /></RoleGuard>} />
          
          {/* Protected Pages - Financeiro (Staff Only) */}
          <Route path="/financeiro" element={<RoleGuard allowedUserTypes={['staff']}><Financeiro /></RoleGuard>} />
          <Route path="/financeiro/faturamento" element={<RoleGuard allowedUserTypes={['staff']}><Faturamento /></RoleGuard>} />
          <Route path="/financeiro/contas" element={<RoleGuard allowedUserTypes={['staff']}><Financeiro /></RoleGuard>} />
          <Route path="/financeiro/relatorios" element={<RoleGuard allowedUserTypes={['staff']}><Financeiro /></RoleGuard>} />
          <Route path="/financial" element={<AuthGuard><FinancialDashboard /></AuthGuard>} />
          
          {/* Protected Pages - Estoque (Staff Only) */}
          <Route path="/estoque" element={<RoleGuard allowedUserTypes={['staff']}><Estoque /></RoleGuard>} />
          <Route path="/estoque/materiais" element={<RoleGuard allowedUserTypes={['staff']}><Estoque /></RoleGuard>} />
          <Route path="/estoque/medicamentos" element={<RoleGuard allowedUserTypes={['staff']}><Estoque /></RoleGuard>} />
          <Route path="/estoque/baixa" element={<RoleGuard allowedUserTypes={['staff']}><Estoque /></RoleGuard>} />
          
          {/* Protected Pages - Procedimentos (Staff Only) */}
          <Route path="/procedimentos" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          <Route path="/procedimentos/fichas" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          <Route path="/procedimentos/realizados" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          
          {/* Protected Pages - Relatórios & BI (Staff Only) */}
          <Route path="/relatorios" element={<RoleGuard allowedUserTypes={['staff']}><Relatorios /></RoleGuard>} />
          <Route path="/relatorios/clinicos" element={<RoleGuard allowedUserTypes={['staff']}><Relatorios /></RoleGuard>} />
          <Route path="/relatorios/financeiros" element={<RoleGuard allowedUserTypes={['staff']}><Relatorios /></RoleGuard>} />
          <Route path="/relatorios/exportar" element={<RoleGuard allowedUserTypes={['staff']}><Relatorios /></RoleGuard>} />
          
          {/* Protected Pages - Administração & Comercial (Staff Only) */}
          <Route path="/admin" element={<RoleGuard allowedUserTypes={['staff']}><Admin /></RoleGuard>} />
          <Route path="/admin/licencas" element={<RoleGuard allowedUserTypes={['staff']}><Licencas /></RoleGuard>} />
          <Route path="/admin/usuarios" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          <Route path="/admin/comercial" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          <Route path="/licencas" element={<RoleGuard allowedUserTypes={['staff']}><Licencas /></RoleGuard>} />
          <Route path="/unidades" element={<RoleGuard allowedUserTypes={['staff']}><Unidades /></RoleGuard>} />
          
          {/* Additional Routes for Sidebar Navigation */}
          <Route path="/demo" element={<RoleGuard allowedUserTypes={['staff']}><Demo /></RoleGuard>} />
          
          {/* Protected Pages - Patient Portal (Patients Only) */}
          <Route path="/patient" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/dashboard" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/appointments" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/medical-records" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/prescriptions" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/profile" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/patient/billing" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          
          {/* Legacy Portuguese Routes (for backward compatibility) */}
          <Route path="/paciente" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/dashboard" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/agendamentos" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/prontuario" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/receitas" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/profile" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/paciente/financeiro" element={<RoleGuard allowedUserTypes={['patient']}><PatientApp /></RoleGuard>} />
          <Route path="/portal" element={<RoleGuard allowedUserTypes={['patient']}><Portal /></RoleGuard>} />
          
          {/* Protected Pages - System */}
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/configuracoes" element={<AuthGuard><Configuracoes /></AuthGuard>} />
          <Route path="/suporte" element={<AuthGuard><Demo /></AuthGuard>} />
          <Route path="/auditoria" element={<AuthGuard><Demo /></AuthGuard>} />
          
          {/* Legacy Routes (Staff Only) */}
          <Route path="/agenda" element={<RoleGuard allowedUserTypes={['staff']}><Agenda /></RoleGuard>} />
          <Route path="/agenda/novo" element={<RoleGuard allowedUserTypes={['staff']}><NovoAgendamento /></RoleGuard>} />
          <Route path="/pacientes/novo" element={<RoleGuard allowedUserTypes={['staff']}><NovoPaciente /></RoleGuard>} />
          <Route path="/receitas/nova" element={<RoleGuard allowedUserTypes={['staff']}><NovaReceita /></RoleGuard>} />
          <Route path="/telemedicina" element={<RoleGuard allowedUserTypes={['staff']}><Telemedicina /></RoleGuard>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
