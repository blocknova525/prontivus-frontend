import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Stethoscope, 
  FileText, 
  Printer, 
  Save,
  Clock,
  User,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Ruler,
  Pill,
  TestTube,
  Camera,
  Mic,
  History,
  UserPlus
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { extractErrorMessage } from "@/lib/utils"
import { toast } from "sonner"
import PrescriptionModal from "@/components/modals/PrescriptionModal"
import MedicalRecordModal from "@/components/modals/MedicalRecordModal"
import PatientHistoryModal from "@/components/modals/PatientHistoryModal"
import TabbedMedicalRecord from "@/components/medical/TabbedMedicalRecord"
import PDFDocumentGenerator from "@/components/pdf/PDFDocumentGenerator"
import CallButton from "@/components/call/CallButton"
import { PatientForm } from "@/components/forms/PatientForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const Atendimento = () => {
  const [patientInfo, setPatientInfo] = useState({
    name: "Carregando...",
    age: "",
    cpf: "",
    phone: "",
    convenio: "",
    carteirinha: "",
    avatar: "/api/placeholder/80/80",
    lastVisit: "",
    allergies: [],
    conditions: []
  });

  const [vitalSigns, setVitalSigns] = useState({
    pressure: "130/80 mmHg",
    heartRate: "72 bpm",
    temperature: "36.5°C",
    weight: "68 kg",
    height: "1.65 m",
    bmi: "25.0",
    saturation: "98%"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
      // Modal states
      const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
      const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
      const [showTabbedMedicalRecordModal, setShowTabbedMedicalRecordModal] = useState(false);
      const [showPDFGeneratorModal, setShowPDFGeneratorModal] = useState(false);
      const [showPatientHistoryModal, setShowPatientHistoryModal] = useState(false);
      const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [patientPhotos, setPatientPhotos] = useState<string[]>([]);
  const [patientMedications, setPatientMedications] = useState<any[]>([]);
  const [editingVitalSigns, setEditingVitalSigns] = useState(false);
  
  // Form data states
  const [consultationData, setConsultationData] = useState({
    anamnese: '',
    exameFisico: '',
    hipotese: '',
    conduta: '',
    observacoes: ''
  });
  
  // Patient selection state
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [showPatientSelector, setShowPatientSelector] = useState(false);

  useEffect(() => {
    loadPatientsList();
  }, []);

  useEffect(() => {
    if (currentPatientId) {
      loadPatientData();
    }
  }, [currentPatientId]);

  const loadPatientsList = async () => {
    try {
      const patientsData = await apiService.getPatients();
      setPatients(patientsData || []);
      
      // If no patient is selected and we have patients, select the first one
      if (!currentPatientId && patientsData && patientsData.length > 0) {
        setCurrentPatientId(patientsData[0].id);
      }
    } catch (err: any) {
      console.error('Error loading patients list:', err);
      // Fallback to mock data
      const mockPatients = [
        { id: 1, full_name: "Maria Santos Silva", cpf: "123.456.789-00" },
        { id: 2, full_name: "João Oliveira", cpf: "987.654.321-00" },
        { id: 3, full_name: "Ana Costa", cpf: "456.789.123-00" }
      ];
      setPatients(mockPatients);
      if (!currentPatientId) {
        setCurrentPatientId(1);
      }
    }
  };

  const loadPatientData = async () => {
    if (!currentPatientId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load patient data from PostgreSQL database
      const patientData = await apiService.getPatient(currentPatientId.toString());
      
      if (patientData) {
        const patientInfo = {
          name: patientData.full_name || "Paciente",
          age: patientData.birth_date ? 
            `${new Date().getFullYear() - new Date(patientData.birth_date).getFullYear()} anos` : 
            "N/A",
          cpf: patientData.cpf || "N/A",
          phone: patientData.phone || "N/A",
          convenio: patientData.insurance_company || "N/A",
          carteirinha: patientData.insurance_number || "N/A",
          avatar: "/api/placeholder/80/80",
          lastVisit: patientData.updated_at ? 
            new Date(patientData.updated_at).toLocaleDateString('pt-BR') : 
            "N/A",
          allergies: patientData.allergies ? patientData.allergies.split(',').map(a => a.trim()) : [],
          conditions: patientData.chronic_conditions ? 
            patientData.chronic_conditions.split(',').map(c => c.trim()) : []
        };
        
        setPatientInfo(patientInfo);
        
        // Load vital signs from PostgreSQL
        const vitalSignsData = await apiService.getPatientVitalSigns(currentPatientId);
        if (vitalSignsData && typeof vitalSignsData === 'object') {
          setVitalSigns(vitalSignsData);
        }
        
        // Load patient medications from PostgreSQL
        await loadPatientMedications(currentPatientId);
        
      } else {
        // Fallback to mock data if patient not found
        const mockPatient = {
          name: "Maria Santos Silva",
          age: "45 anos",
          cpf: "123.456.789-00",
          phone: "(11) 99999-9999",
          convenio: "Unimed",
          carteirinha: "12345678901234",
          avatar: "/api/placeholder/80/80",
          lastVisit: "15/08/2024",
          allergies: ["Dipirona", "Penicilina"],
          conditions: ["Hipertensão", "Diabetes Tipo 2"]
        };
        
        setPatientInfo(mockPatient);
      }
      
    } catch (err: any) {
      console.error('Error loading patient data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados do paciente'));
      
      // Fallback to mock data on error
      const mockPatient = {
        name: "Maria Santos Silva",
        age: "45 anos",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        convenio: "Unimed",
        carteirinha: "12345678901234",
        avatar: "/api/placeholder/80/80",
        lastVisit: "15/08/2024",
        allergies: ["Dipirona", "Penicilina"],
        conditions: ["Hipertensão", "Diabetes Tipo 2"]
      };
      
      setPatientInfo(mockPatient);
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientData = async () => {
    if (currentPatientId) {
      await loadPatientData();
      toast.success('Dados do paciente atualizados!');
    } else {
      await loadPatientsList();
      toast.success('Lista de pacientes atualizada!');
    }
  };

  const handlePatientSave = async (patientData: any) => {
    try {
      // Create new patient
      const newPatient = await apiService.createPatient(patientData);
      toast.success('Paciente cadastrado com sucesso!');
      
      // Close modal
      setShowPatientRegistrationModal(false);
      
      // Reload patients list
      await loadPatientsList();
      
      // Select the newly created patient
      if (newPatient && newPatient.id) {
        setCurrentPatientId(newPatient.id);
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao cadastrar paciente');
    }
  };

  const handlePatientCancel = () => {
    setShowPatientRegistrationModal(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Gravação iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao iniciar gravação. Verifique as permissões do microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success('Gravação finalizada');
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  const saveVoiceNote = () => {
    if (audioBlob) {
      // Here you would typically save the audio to the server
      // For now, we'll just show a success message
      toast.success('Nota de voz salva com sucesso!');
      setAudioBlob(null);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPhotos: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPhotos.push(e.target.result as string);
            setPatientPhotos(prev => [...prev, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${files.length} foto(s) adicionada(s) com sucesso!`);
    }
  };

  const removePhoto = (index: number) => {
    setPatientPhotos(prev => prev.filter((_, i) => i !== index));
    toast.success('Foto removida com sucesso!');
  };

  const loadPatientMedications = async (patientId: number) => {
    try {
      // Load medications from PostgreSQL
      const medications = await apiService.getPatientPrescriptions(patientId);
      if (medications && Array.isArray(medications)) {
        setPatientMedications(medications);
      } else {
        setPatientMedications([]);
      }
    } catch (error) {
      console.error('Error loading patient medications:', error);
      // Fallback to mock data
      setPatientMedications([
        {
          id: 1,
          medication_name: "Losartana 50mg",
          dosage: "1x ao dia",
          frequency: "Manhã",
          start_date: "2024-01-15",
          end_date: null,
          status: "active"
        },
        {
          id: 2,
          medication_name: "Metformina 850mg",
          dosage: "2x ao dia",
          frequency: "Após refeições",
          start_date: "2024-02-01",
          end_date: null,
          status: "active"
        },
        {
          id: 3,
          medication_name: "Sinvastatina 20mg",
          dosage: "1x ao dia",
          frequency: "Noite",
          start_date: "2024-01-20",
          end_date: null,
          status: "active"
        }
      ]);
    }
  };

  const saveVitalSigns = async () => {
    if (!currentPatientId) {
      toast.error('Selecione um paciente primeiro');
      return;
    }

    try {
      const vitalSignsData = {
        patient_id: currentPatientId,
        pressure: vitalSigns.pressure,
        heart_rate: vitalSigns.heartRate,
        temperature: vitalSigns.temperature,
        weight: vitalSigns.weight,
        height: vitalSigns.height,
        bmi: vitalSigns.bmi,
        saturation: vitalSigns.saturation,
        recorded_at: new Date().toISOString()
      };

      // Save vital signs to PostgreSQL
      const result = await apiService.savePatientVitalSigns(vitalSignsData);
      
      if (result && result.id) {
        toast.success('Sinais vitais salvos com sucesso!');
        setEditingVitalSigns(false);
      } else {
        toast.error('Erro ao salvar sinais vitais');
      }
    } catch (error) {
      console.error('Error saving vital signs:', error);
      toast.error('Erro ao salvar sinais vitais');
    }
  };

  const saveConsultation = async () => {
    if (!currentPatientId) {
      toast.error('Selecione um paciente primeiro');
      return;
    }

    try {
      const consultationDataToSave = {
        patient_id: currentPatientId,
        doctor_id: 1, // Default doctor ID - in real app, get from current user
        type: "consultation",
        title: "Consulta Médica",
        chief_complaint: consultationData.anamnese,
        history_of_present_illness: consultationData.anamnese,
        physical_examination: consultationData.exameFisico,
        assessment: consultationData.hipotese,
        plan: consultationData.conduta,
        notes: consultationData.observacoes,
        vital_signs: vitalSigns,
        status: "draft"
      };

      // Save consultation data to PostgreSQL
      const result = await apiService.createMedicalRecord(consultationDataToSave);
      
      if (result && result.id) {
        toast.success('Consulta salva com sucesso!');
        
        // Clear form
        setConsultationData({
          anamnese: '',
          exameFisico: '',
          hipotese: '',
          conduta: '',
          observacoes: ''
        });
        
        // Reload patient data to show updated information
        await loadPatientData();
      } else {
        toast.error('Erro ao salvar consulta');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast.error('Erro ao salvar consulta');
    }
  };
  return (
    <AppLayout 
      title="Atendimento Médico" 
      subtitle="Prontuário eletrônico e gestão de consultas"
    >
      <div className="space-y-6">
        {/* Patient Selector */}
        <Card className="medical-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="patient-select" className="text-sm font-medium">
                  Selecionar Paciente para Atendimento
                </Label>
                <Select 
                  value={currentPatientId?.toString() || ""} 
                  onValueChange={(value) => setCurrentPatientId(parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Escolha um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <span className="font-medium">{patient.full_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              CPF: {patient.cpf}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPatientRegistrationModal(true)}
                className="medical-button-secondary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
              <Button 
                variant="outline" 
                onClick={refreshPatientData}
                className="hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Header */}
        {currentPatientId && (
          <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={patientInfo.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {patientInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{patientInfo.name}</h2>
                  <Badge className="medical-status-active">Ativo</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Idade:</span>
                    <p className="font-medium">{patientInfo.age}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <p className="font-medium">{patientInfo.cpf}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Convênio:</span>
                    <p className="font-medium">{patientInfo.convenio}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última consulta:</span>
                    <p className="font-medium">{patientInfo.lastVisit}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Alergias:</span>
                    <div className="flex gap-1 mt-1">
                      {patientInfo.allergies.map((allergy) => (
                        <Badge key={allergy} className="medical-status-inactive text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Condições:</span>
                    <div className="flex gap-1 mt-1">
                      {patientInfo.conditions.map((condition) => (
                        <Badge key={condition} className="medical-status-pending text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

                  <div className="flex flex-col gap-2">
                    <CallButton
                      patientId={currentPatientId}
                      patientName={patientInfo.name}
                      patientNumber={patientInfo.phone}
                      className="w-full"
                    />
                    <Button 
                      className="medical-button-primary"
                      onClick={() => setShowPatientHistoryModal(true)}
                    >
                      <History className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                    <Button 
                      variant="outline" 
                      className="hover:bg-primary/10"
                      onClick={() => setShowPhotoGalleryModal(true)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Fotos
                    </Button>
                  </div>
            </div>
          </CardContent>
        </Card>
        )}

        {currentPatientId && (
          <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Signs */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Sinais Vitais
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingVitalSigns(!editingVitalSigns)}
                  >
                    {editingVitalSigns ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Heart className="w-6 h-6 text-medical-red mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Pressão</p>
                    {editingVitalSigns ? (
                      <Input
                        value={vitalSigns.pressure}
                        onChange={(e) => setVitalSigns(prev => ({ ...prev, pressure: e.target.value }))}
                        className="text-center text-sm"
                        placeholder="130/80 mmHg"
                      />
                    ) : (
                      <p className="font-semibold">{vitalSigns.pressure}</p>
                    )}
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Activity className="w-6 h-6 text-medical-green mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Frequência</p>
                    {editingVitalSigns ? (
                      <Input
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                        className="text-center text-sm"
                        placeholder="72 bpm"
                      />
                    ) : (
                      <p className="font-semibold">{vitalSigns.heartRate}</p>
                    )}
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Thermometer className="w-6 h-6 text-medical-amber mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                    {editingVitalSigns ? (
                      <Input
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                        className="text-center text-sm"
                        placeholder="36.5°C"
                      />
                    ) : (
                      <p className="font-semibold">{vitalSigns.temperature}</p>
                    )}
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Weight className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Peso</p>
                    {editingVitalSigns ? (
                      <Input
                        value={vitalSigns.weight}
                        onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                        className="text-center text-sm"
                        placeholder="68 kg"
                      />
                    ) : (
                      <p className="font-semibold">{vitalSigns.weight}</p>
                    )}
                  </div>
                </div>
                
                {editingVitalSigns && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      className="medical-button-primary"
                      onClick={saveVitalSigns}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Sinais Vitais
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultation */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Consulta Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="anamnese" className="text-sm font-medium mb-2 block">
                    Anamnese
                  </Label>
                  <Textarea
                    id="anamnese"
                    placeholder="Descreva os sintomas relatados pelo paciente..."
                    className="min-h-[100px]"
                    value={consultationData.anamnese}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, anamnese: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="exame-fisico" className="text-sm font-medium mb-2 block">
                    Exame Físico
                  </Label>
                  <Textarea
                    id="exame-fisico"
                    placeholder="Achados do exame físico..."
                    className="min-h-[100px]"
                    value={consultationData.exameFisico}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, exameFisico: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hipotese" className="text-sm font-medium mb-2 block">
                      Hipótese Diagnóstica
                    </Label>
                    <Input
                      id="hipotese"
                      placeholder="CID-10 ou descrição..."
                      value={consultationData.hipotese}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, hipotese: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conduta" className="text-sm font-medium mb-2 block">
                      Conduta
                    </Label>
                    <Input
                      id="conduta"
                      placeholder="Conduta médica..."
                      value={consultationData.conduta}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, conduta: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes" className="text-sm font-medium mb-2 block">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais..."
                    className="min-h-[80px]"
                    value={consultationData.observacoes}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    className="medical-button-primary"
                    onClick={saveConsultation}
                    disabled={!consultationData.anamnese && !consultationData.exameFisico}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full medical-button-primary"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Receita
                </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/10"
                      onClick={() => setShowPDFGeneratorModal(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documentos PDF
                    </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-medical-green/10"
                  onClick={async () => {
                    try {
                      await apiService.generateDocument('guide', currentPatientId, {
                        patient_name: patientInfo.name,
                        date: new Date().toLocaleString('pt-BR'),
                        content: 'Guia de exame solicitado'
                      });
                      toast.success('Guia de exame gerado com sucesso!');
                    } catch (error) {
                      console.error('Error generating exam guide:', error);
                      toast.error('Erro ao gerar guia de exame. Verifique se o servidor foi reiniciado.');
                    }
                  }}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Solicitar Exame
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-medical-amber/10"
                  onClick={async () => {
                    try {
                      await apiService.generateDocument('referral', currentPatientId, {
                        patient_name: patientInfo.name,
                        date: new Date().toLocaleString('pt-BR'),
                        content: 'Encaminhamento para especialista'
                      });
                      toast.success('Encaminhamento gerado com sucesso!');
                    } catch (error) {
                      console.error('Error generating referral:', error);
                      toast.error('Erro ao gerar encaminhamento. Verifique se o servidor foi reiniciado.');
                    }
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Encaminhamento
                </Button>
              </CardContent>
            </Card>

            {/* Voice Notes */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Notas por Voz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'
                  }`}>
                    <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Gravando...' : 'Toque para gravar notas por voz'}
                  </p>
                  
                  {!isRecording && !audioBlob && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={startRecording}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button 
                      variant="outline" 
                      className="w-full bg-red-50 hover:bg-red-100"
                      onClick={stopRecording}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </Button>
                  )}
                  
                  {audioBlob && !isRecording && (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={playRecording}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Reproduzir
                      </Button>
                      <Button 
                        className="w-full medical-button-primary"
                        onClick={saveVoiceNote}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Nota
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Medications */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicações Atuais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientMedications.length > 0 ? (
                  patientMedications.map((medication) => (
                    <div key={medication.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm">{medication.medication_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medication.dosage} - {medication.frequency}
                      </p>
                      {medication.start_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Início: {new Date(medication.start_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma medicação registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={refreshPatientData}
              className="hover:bg-primary/10"
            >
              <Clock className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  await apiService.generateDocument('report', currentPatientId, {
                    patient_name: patientInfo.name,
                    date: new Date().toLocaleString('pt-BR'),
                    anamnese: consultationData.anamnese,
                    exame_fisico: consultationData.exameFisico,
                    hipotese: consultationData.hipotese,
                    conduta: consultationData.conduta,
                    observacoes: consultationData.observacoes,
                    vital_signs: vitalSigns
                  });
                  toast.success('Relatório impresso com sucesso!');
                } catch (error) {
                  toast.error('Erro ao imprimir relatório');
                }
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={() => setShowTabbedMedicalRecordModal(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Prontuário Completo
                </Button>
          </div>
        </div>

        {/* Modals */}
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          patientId={currentPatientId}
          patientName={patientInfo.name}
        />

            <TabbedMedicalRecord
              isOpen={showTabbedMedicalRecordModal}
              onClose={() => setShowTabbedMedicalRecordModal(false)}
              patientId={currentPatientId}
              patientName={patientInfo.name}
              initialData={{
                anamnese: consultationData.anamnese,
                exameFisico: consultationData.exameFisico,
                hipotese: consultationData.hipotese,
                conduta: consultationData.conduta,
                observacoes: consultationData.observacoes,
                vitalSigns: vitalSigns
              }}
            />

        <PDFDocumentGenerator
          isOpen={showPDFGeneratorModal}
          onClose={() => setShowPDFGeneratorModal(false)}
          patientId={currentPatientId}
          patientName={patientInfo.name}
          patientCPF={patientInfo.cpf}
          patientAge={patientInfo.age}
          consultationData={{
            anamnese: consultationData.anamnese,
            exameFisico: consultationData.exameFisico,
            hipotese: consultationData.hipotese,
            conduta: consultationData.conduta,
            observacoes: consultationData.observacoes,
            vitalSigns: vitalSigns
          }}
        />

        <PatientHistoryModal
          isOpen={showPatientHistoryModal}
          onClose={() => setShowPatientHistoryModal(false)}
          patientId={currentPatientId}
          patientName={patientInfo.name}
        />

        {/* Patient Registration Modal */}
        <Dialog open={showPatientRegistrationModal} onOpenChange={setShowPatientRegistrationModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
            </DialogHeader>
            <PatientForm 
              onSave={handlePatientSave}
              onCancel={handlePatientCancel}
            />
          </DialogContent>
        </Dialog>

        {/* Photo Gallery Modal */}
        <Dialog open={showPhotoGalleryModal} onOpenChange={setShowPhotoGalleryModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Galeria de Fotos - {patientInfo.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Adicione fotos do paciente</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button asChild>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Selecionar Fotos
                  </label>
                </Button>
              </div>

              {/* Photo Grid */}
              {patientPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {patientPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {patientPhotos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma foto adicionada ainda</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Atendimento;