import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  CreditCard,
  Video,
  Download,
  Upload,
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
  Pill,
  Stethoscope
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import PatientAppointmentForm from '@/components/forms/PatientAppointmentForm';
import PatientProfileEditForm from '@/components/forms/PatientProfileEditForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface PatientProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: string;
  address: string;
  insurance_company?: string;
  insurance_number?: string;
  avatar_url?: string;
}

interface Appointment {
  id: number;
  doctor_name: string;
  doctor_specialty: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  is_online: boolean;
}

interface Prescription {
  id: number;
  doctor_name: string;
  issued_date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes?: string;
}

interface MedicalRecord {
  id: number;
  doctor_name: string;
  date: string;
  type: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

const PatientApp = () => {
  const location = useLocation();
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showProfileEditForm, setShowProfileEditForm] = useState(false);

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    // English routes
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/medical-records')) return 'records';
    if (path.includes('/prescriptions')) return 'prescriptions';
    if (path.includes('/profile')) return 'profile';
    // Portuguese routes (legacy support)
    if (path.includes('/agendamentos')) return 'appointments';
    if (path.includes('/prontuario')) return 'records';
    if (path.includes('/receitas')) return 'prescriptions';
    return 'dashboard'; // default
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load current patient profile from API
      const userResponse = await apiService.getCurrentPatient();
      const userData = userResponse;
      
      setPatientProfile({
        id: userData.id,
        full_name: userData.full_name || 'Ana Costa',
        email: userData.email || 'ana.costa@email.com',
        phone: userData.phone || '(11) 99999-9999',
        cpf: userData.cpf || '123.456.789-00',
        birth_date: userData.birth_date || '1985-03-15',
        gender: userData.gender || 'female',
        address: userData.address || 'Rua das Flores, 123',
        insurance_company: userData.insurance_company || 'Unimed',
        insurance_number: userData.insurance_number || '123456789',
        avatar_url: userData.avatar_url
      });

      // Load patient appointments from database
      const appointmentsResponse = await apiService.getAppointments({ patient_id: userData.id });
      const appointmentsData = appointmentsResponse || [];
      
      setAppointments(appointmentsData.map((apt: any) => ({
        id: apt.id,
        doctor_name: apt.doctor_name || apt.doctor?.full_name || 'Médico',
        doctor_specialty: apt.doctor_specialty || apt.doctor?.specialty || 'Especialidade',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        type: apt.type || 'Consulta',
        status: apt.status || 'scheduled',
        notes: apt.notes || '',
        is_online: apt.type === 'telemedicine'
      })));

      // Load prescriptions from database with fallback to mock data
      try {
        const prescriptionsResponse = await apiService.getPrescriptions({ patient_id: userData.id });
        const prescriptionsData = prescriptionsResponse || [];
        
        setPrescriptions(prescriptionsData.map((prescription: any) => ({
          id: prescription.id,
          doctor_name: prescription.doctor_name || prescription.doctor?.full_name || 'Médico',
          issued_date: prescription.issued_date || prescription.created_at,
          medications: prescription.medications || prescription.medication_items || [],
          notes: prescription.notes || prescription.instructions
        })));
      } catch (prescriptionErr) {
        console.log('Prescriptions endpoint not available, using mock data');
        // Fallback to mock prescriptions data
        setPrescriptions([
          {
            id: 1,
            doctor_name: "Dr. João Silva",
            issued_date: "2024-01-20",
            medications: [
              {
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "3x ao dia",
                duration: "7 dias"
              },
              {
                name: "Ibuprofeno", 
                dosage: "400mg",
                frequency: "2x ao dia",
                duration: "5 dias"
              }
            ],
            notes: "Tomar com alimentos"
          },
          {
            id: 2,
            doctor_name: "Dra. Maria Santos",
            issued_date: "2024-01-15",
            medications: [
              {
                name: "Vitamina D",
                dosage: "1000 UI",
                frequency: "1x ao dia",
                duration: "30 dias"
              }
            ],
            notes: "Tomar pela manhã"
          }
        ]);
      }

      // Load medical records from database with fallback to mock data
      try {
        const medicalRecordsResponse = await apiService.getMedicalRecords({ patient_id: userData.id });
        const medicalRecordsData = medicalRecordsResponse || [];
        
        setMedicalRecords(medicalRecordsData.map((record: any) => ({
          id: record.id,
          doctor_name: record.doctor_name || record.doctor?.full_name || 'Médico',
          date: record.date || record.created_at,
          type: record.type || record.record_type || 'Consulta',
          diagnosis: record.diagnosis || record.primary_diagnosis || 'Não informado',
          treatment: record.treatment || record.treatment_plan || 'Não informado',
          notes: record.notes || record.observations
        })));
      } catch (recordsErr) {
        console.log('Medical records endpoint not available, using mock data');
        // Fallback to mock medical records data
        setMedicalRecords([
          {
            id: 1,
            doctor_name: "Dr. João Silva",
            date: "2024-01-20",
            type: "Consulta",
            diagnosis: "Hipertensão arterial",
            treatment: "Controle da pressão arterial com medicação",
            notes: "Paciente apresentou melhora significativa"
          },
          {
            id: 2,
            doctor_name: "Dra. Maria Santos",
            date: "2024-01-15",
            type: "Retorno",
            diagnosis: "Diabetes tipo 2",
            treatment: "Controle glicêmico e dieta",
            notes: "Glicemia controlada"
          }
        ]);
      }

    } catch (err: any) {
      console.error('Error loading patient data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados do paciente'));
      
      // Set fallback data
      setPatientProfile({
        id: 1,
        full_name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        birth_date: '1985-03-15',
        gender: 'female',
        address: 'Rua das Flores, 123',
        insurance_company: 'Unimed',
        insurance_number: '123456789'
      });
      
      setAppointments([
        {
          id: 1,
          doctor_name: 'Dr. João Silva',
          doctor_specialty: 'Clínica Geral',
          appointment_date: '2024-01-25',
          appointment_time: '10:00',
          type: 'Consulta',
          status: 'scheduled',
          notes: 'Consulta de rotina',
          is_online: false
        }
      ]);
      
      setPrescriptions([
        {
          id: 1,
          doctor_name: 'Dr. João Silva',
          issued_date: '2024-01-20',
          medications: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: '3x ao dia',
              duration: '7 dias'
            }
          ],
          notes: 'Tomar com alimentos'
        }
      ]);
      
      setMedicalRecords([
        {
          id: 1,
          doctor_name: 'Dr. João Silva',
          date: '2024-01-20',
          type: 'Consulta',
          diagnosis: 'Resfriado comum',
          treatment: 'Repouso e medicamentos sintomáticos',
          notes: 'Paciente apresentou melhora significativa'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-0 shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold tracking-tight">Olá, {patientProfile?.full_name}!</h2>
              <p className="text-blue-100 text-lg font-medium mt-1">Bem-vindo ao seu portal de saúde</p>
              <p className="text-blue-200 text-sm mt-2">Gerencie sua saúde de forma inteligente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800">Próxima Consulta</CardTitle>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {appointments.find(apt => apt.status === 'scheduled')?.appointment_date 
                ? format(new Date(appointments.find(apt => apt.status === 'scheduled')!.appointment_date), 'dd/MM')
                : 'N/A'}
            </div>
            <p className="text-sm text-emerald-700 font-medium mt-1">
              {appointments.find(apt => apt.status === 'scheduled')?.doctor_name || 'Nenhuma consulta agendada'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">Prescrições Ativas</CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Pill className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{prescriptions.length}</div>
            <p className="text-sm text-blue-700 font-medium mt-1">
              Medicamentos em uso
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-800">Última Consulta</CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {medicalRecords.length > 0 
                ? format(new Date(medicalRecords[0].date), 'dd/MM')
                : 'N/A'}
            </div>
            <p className="text-sm text-purple-700 font-medium mt-1">
              {medicalRecords.length > 0 ? medicalRecords[0].doctor_name : 'Nenhuma consulta'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Ações Rápidas</CardTitle>
          <CardDescription className="text-slate-600">Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:shadow-md transition-all duration-300 group"
              onClick={() => setShowAppointmentForm(true)}
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-emerald-800">Agendar Consulta</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-md transition-all duration-300 group"
              onClick={() => setShowAppointmentForm(true)}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-blue-800">Consulta Online</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:shadow-md transition-all duration-300 group"
              onClick={() => window.location.href = '/patient/medical-records'}
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-800">Meu Prontuário</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 hover:shadow-md transition-all duration-300 group"
              onClick={() => window.location.href = '/patient/prescriptions'}
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-orange-800">Minhas Receitas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">Atividade Recente</CardTitle>
            <CardDescription className="text-slate-600">Suas últimas interações com o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{appointment.doctor_name}</h4>
                    <p className="text-sm text-slate-600">
                      {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.appointment_time}
                    </p>
                    <Badge 
                      variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta agendada</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAppointmentForm(true)}
                  >
                    Agendar Primeira Consulta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">Resumo de Saúde</CardTitle>
            <CardDescription className="text-slate-600">Informações importantes sobre sua saúde</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/60">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Medicamentos Ativos</h4>
                  <p className="text-sm text-slate-600">{prescriptions.length} prescrições ativas</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/patient/prescriptions'}
                  >
                    Ver Receitas
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/60">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Prontuário Médico</h4>
                  <p className="text-sm text-slate-600">{medicalRecords.length} registros médicos</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/patient/medical-records'}
                  >
                    Ver Prontuário
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/60">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Convênio</h4>
                  <p className="text-sm text-slate-600">{patientProfile?.insurance_company || 'Não informado'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/patient/profile'}
                  >
                    Ver Perfil
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    loadPatientData(); // Reload data to show new appointment
  };

  const downloadMedicalRecord = async (record: MedicalRecord) => {
    try {
      console.log('Starting PDF generation for record:', record);
      // Generate PDF for individual medical record
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generateReport) {
        throw new Error('PDF service not available or generateReport method missing');
      }
      const pdfData = {
        patientName: patientProfile?.full_name || 'Paciente',
        patientCPF: patientProfile?.cpf || '',
        patientAge: patientProfile?.birth_date ? 
          (new Date().getFullYear() - new Date(patientProfile.birth_date).getFullYear()).toString() : '0',
        doctorName: record.doctor_name,
        doctorCRM: '12345', // Default CRM
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: record.date,
        content: record,
        chiefComplaint: record.type,
        historyOfPresentIllness: record.diagnosis,
        physicalExamination: record.treatment,
        assessment: record.diagnosis,
        plan: record.treatment,
        vitalSigns: { pressure: 'Não informado', temperature: 'Não informado', weight: 'Não informado', heartRate: 'Não informado', saturation: 'Não informado', height: 'Não informado' },
        notes: record.notes || ''
      };
      
      console.log('PDF data prepared:', pdfData);
      const doc = await pdfService.generateReport(pdfData);
      console.log('PDF document generated:', doc);
      doc.save(`prontuario_${record.id}_${record.date}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating medical record PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Erro ao gerar PDF do prontuário: ${error.message}`);
    }
  };

  const downloadCompleteMedicalRecords = async () => {
    try {
      if (medicalRecords.length === 0) {
        alert('Nenhum registro médico encontrado para download');
        return;
      }

      console.log('Starting complete PDF generation for', medicalRecords.length, 'records');
      // Generate PDF for complete medical records
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded for complete download:', pdfService);
      
      if (!pdfService || !pdfService.generateReport) {
        throw new Error('PDF service not available or generateReport method missing');
      }
      const pdfData = {
        patientName: patientProfile?.full_name || 'Paciente',
        patientCPF: patientProfile?.cpf || '',
        patientAge: patientProfile?.birth_date ? 
          (new Date().getFullYear() - new Date(patientProfile.birth_date).getFullYear()).toString() : '0',
        doctorName: 'Dr. João Silva', // Default doctor
        doctorCRM: '12345',
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toISOString().split('T')[0],
        content: medicalRecords,
        chiefComplaint: 'Histórico Completo',
        historyOfPresentIllness: `Prontuário completo com ${medicalRecords.length} registros médicos`,
        physicalExamination: medicalRecords.map(r => `${r.date}: ${r.type} - ${r.diagnosis}`).join('\n'),
        assessment: 'Resumo de todos os atendimentos',
        plan: 'Continuidade do tratamento conforme orientações médicas',
        vitalSigns: { pressure: 'Conforme registros individuais', temperature: 'Conforme registros individuais', weight: 'Conforme registros individuais', heartRate: 'Conforme registros individuais', saturation: 'Conforme registros individuais', height: 'Conforme registros individuais' },
        notes: `Total de ${medicalRecords.length} consultas registradas`
      };
      
      console.log('Complete PDF data prepared:', pdfData);
      const doc = await pdfService.generateReport(pdfData);
      console.log('Complete PDF document generated:', doc);
      doc.save(`prontuario_completo_${patientProfile?.full_name?.replace(' ', '_') || 'paciente'}.pdf`);
      console.log('Complete PDF saved successfully');
    } catch (error) {
      console.error('Error generating complete medical records PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Erro ao gerar PDF do prontuário completo: ${error.message}`);
    }
  };

  const downloadPrescription = async (prescription: any) => {
    try {
      console.log('Starting prescription PDF generation for:', prescription);
      // Generate PDF for individual prescription
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generatePrescription) {
        throw new Error('PDF service not available or generatePrescription method missing');
      }
      
      const pdfData = {
        patientName: patientProfile?.full_name || 'Paciente',
        patientCPF: patientProfile?.cpf || '',
        patientAge: patientProfile?.birth_date ? 
          (new Date().getFullYear() - new Date(patientProfile.birth_date).getFullYear()).toString() : '0',
        doctorName: prescription.doctor_name,
        doctorCRM: '12345', // Default CRM
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: prescription.issued_date,
        content: prescription,
        medications: prescription.medications || [],
        notes: prescription.notes || ''
      };
      
      console.log('Prescription PDF data prepared:', pdfData);
      const doc = await pdfService.generatePrescription(pdfData);
      console.log('Prescription PDF document generated:', doc);
      doc.save(`receita_${prescription.id}_${prescription.issued_date}.pdf`);
      console.log('Prescription PDF saved successfully');
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Erro ao gerar PDF da receita: ${error.message}`);
    }
  };

  const downloadAllPrescriptions = async () => {
    try {
      if (prescriptions.length === 0) {
        alert('Nenhuma receita encontrada para download');
        return;
      }

      console.log('Starting complete prescriptions PDF generation for', prescriptions.length, 'prescriptions');
      // Generate PDF for all prescriptions
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded for complete prescriptions download:', pdfService);
      
      if (!pdfService || !pdfService.generatePrescription) {
        throw new Error('PDF service not available or generatePrescription method missing');
      }
      
      // Create a combined prescription with all medications
      const allMedications = prescriptions.flatMap(p => p.medications || []);
      const allNotes = prescriptions.map(p => `${p.issued_date}: ${p.notes || 'Sem observações'}`).join('\n');
      
      const pdfData = {
        patientName: patientProfile?.full_name || 'Paciente',
        patientCPF: patientProfile?.cpf || '',
        patientAge: patientProfile?.birth_date ? 
          (new Date().getFullYear() - new Date(patientProfile.birth_date).getFullYear()).toString() : '0',
        doctorName: 'Dr. João Silva', // Default doctor
        doctorCRM: '12345',
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toISOString().split('T')[0],
        content: prescriptions,
        medications: allMedications,
        notes: `Receitas médicas completas - Total: ${prescriptions.length} receitas\n\n${allNotes}`
      };
      
      console.log('Complete prescriptions PDF data prepared:', pdfData);
      const doc = await pdfService.generatePrescription(pdfData);
      console.log('Complete prescriptions PDF document generated:', doc);
      doc.save(`receitas_completas_${patientProfile?.full_name?.replace(' ', '_') || 'paciente'}.pdf`);
      console.log('Complete prescriptions PDF saved successfully');
    } catch (error) {
      console.error('Error generating complete prescriptions PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Erro ao gerar PDF das receitas completas: ${error.message}`);
    }
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Consultas</h2>
        <Button onClick={() => setShowAppointmentForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agendar Consulta
        </Button>
      </div>

      {showAppointmentForm && (
        <PatientAppointmentForm
          patientId={patientProfile?.id || 0}
          onSuccess={handleAppointmentSuccess}
          onCancel={() => setShowAppointmentForm(false)}
        />
      )}

      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <Card key={appointment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{appointment.type}</h3>
                    <p className="text-sm text-gray-600">
                      Dr(a). {appointment.doctor_name} - {appointment.doctor_specialty}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.appointment_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    {appointment.is_online && (
                      <Badge variant="outline" className="text-blue-600">
                        <Video className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm"><strong>Observações:</strong> {appointment.notes}</p>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  {appointment.is_online && appointment.status === 'scheduled' && (
                    <Button size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Entrar na Consulta
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma consulta agendada</h3>
              <p className="text-gray-600 mb-4">Você ainda não possui consultas agendadas.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Receitas</h2>
        <Button variant="outline" onClick={downloadAllPrescriptions}>
          <Download className="w-4 h-4 mr-2" />
          Baixar Todas
        </Button>
      </div>

      <div className="space-y-4">
        {prescriptions.length > 0 ? (
          prescriptions.map(prescription => (
            <Card key={prescription.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Receita #{prescription.id}</h3>
                    <p className="text-sm text-gray-600">
                      Dr(a). {prescription.doctor_name} - {format(new Date(prescription.issued_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadPrescription(prescription)}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{medication.name}</h4>
                          <p className="text-sm text-gray-600">{medication.dosage}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p><strong>Frequência:</strong> {medication.frequency}</p>
                          <p><strong>Duração:</strong> {medication.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {prescription.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm"><strong>Observações:</strong> {prescription.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma receita encontrada</h3>
              <p className="text-gray-600">Você ainda não possui receitas médicas.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meu Prontuário</h2>
        <Button variant="outline" onClick={downloadCompleteMedicalRecords}>
          <Download className="w-4 h-4 mr-2" />
          Baixar Completo
        </Button>
      </div>

      <div className="space-y-4">
        {medicalRecords.length > 0 ? (
          medicalRecords.map(record => (
            <Card key={record.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{record.type}</h3>
                    <p className="text-sm text-gray-600">
                      Dr(a). {record.doctor_name} - {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadMedicalRecord(record)}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Diagnóstico</h4>
                    <p className="text-sm text-gray-600">{record.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Tratamento</h4>
                    <p className="text-sm text-gray-600">{record.treatment}</p>
                  </div>
                  {record.notes && (
                    <div>
                      <h4 className="font-medium">Observações</h4>
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
              <p className="text-gray-600">Você ainda não possui registros médicos.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meu Perfil</h2>
        <Button onClick={() => setShowProfileEditForm(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{patientProfile?.full_name}</h3>
                <p className="text-gray-600">{patientProfile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>CPF: {patientProfile?.cpf}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Nascimento: {patientProfile?.birth_date ? format(new Date(patientProfile.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Gênero: {patientProfile?.gender}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contato</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{patientProfile?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{patientProfile?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{patientProfile?.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Convênio</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>{patientProfile?.insurance_company || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Número: {patientProfile?.insurance_number || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <PatientLayout
        title="Portal do Paciente"
        subtitle={`Bem-vindo, ${patientProfile?.full_name || 'Paciente'}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout
        title="Portal do Paciente"
        subtitle={`Bem-vindo, ${patientProfile?.full_name || 'Paciente'}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadPatientData}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      title="Portal do Paciente"
      subtitle={`Bem-vindo, ${patientProfile?.full_name || 'Paciente'}`}
    >
      <div className="space-y-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'records' && renderRecords()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'profile' && renderProfile()}
      </div>

      {/* Appointment Booking Modal */}
      {showAppointmentForm && (
        <PatientAppointmentForm
          patientId={patientProfile?.id || 0}
          onSuccess={handleAppointmentSuccess}
          onCancel={() => setShowAppointmentForm(false)}
        />
      )}

      {/* Profile Edit Modal */}
      <PatientProfileEditForm
        isOpen={showProfileEditForm}
        onClose={() => setShowProfileEditForm(false)}
        patientProfile={patientProfile}
        onSuccess={() => {
          setShowProfileEditForm(false);
          loadPatientData(); // Reload data to show updated profile
        }}
      />
    </PatientLayout>
  );
};

export default PatientApp;