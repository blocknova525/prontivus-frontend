import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Printer, 
  Heart, 
  Activity, 
  Thermometer, 
  Weight, 
  Ruler,
  FileText,
  Stethoscope,
  ClipboardList,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  Eye,
  Download
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import VoiceRecorder from './VoiceRecorder';
import ExamViewer from './ExamViewer';

interface TabbedMedicalRecordProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  initialData: {
    anamnese: string;
    exameFisico: string;
    hipotese: string;
    conduta: string;
    observacoes: string;
    vitalSigns: any;
  };
}

interface ClinicalHistoryData {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  medications: string;
  allergies: string;
  familyHistory: string;
  socialHistory: string;
}

interface PhysicalExamData {
  vitalSigns: {
    pressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
    bmi: string;
    saturation: string;
  };
  generalAppearance: string;
  headNeck: string;
  cardiovascular: string;
  respiratory: string;
  abdomen: string;
  extremities: string;
  neurological: string;
}

interface ProgressData {
  assessment: string;
  plan: string;
  followUpInstructions: string;
  medicationsPrescribed: string;
  proceduresPerformed: string;
  nextAppointment: string;
}

interface ProcedureData {
  procedures: Array<{
    id: string;
    name: string;
    date: string;
    description: string;
    complications: string;
    notes: string;
  }>;
}

const TabbedMedicalRecord: React.FC<TabbedMedicalRecordProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState('clinical-history');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Tab data states
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistoryData>({
    chiefComplaint: initialData.anamnese || '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    medications: '',
    allergies: '',
    familyHistory: '',
    socialHistory: '',
  });

  const [physicalExam, setPhysicalExam] = useState<PhysicalExamData>({
    vitalSigns: initialData.vitalSigns || {
      pressure: '130/80 mmHg',
      heartRate: '72 bpm',
      temperature: '36.5°C',
      weight: '68 kg',
      height: '1.65 m',
      bmi: '25.0',
      saturation: '98%',
    },
    generalAppearance: '',
    headNeck: '',
    cardiovascular: '',
    respiratory: '',
    abdomen: '',
    extremities: '',
    neurological: '',
  });

  const [progress, setProgress] = useState<ProgressData>({
    assessment: initialData.hipotese || '',
    plan: initialData.conduta || '',
    followUpInstructions: '',
    medicationsPrescribed: '',
    proceduresPerformed: '',
    nextAppointment: '',
  });

  const [procedures, setProcedures] = useState<ProcedureData>({
    procedures: []
  });

  useEffect(() => {
    if (isOpen) {
      // Load existing medical record data if available
      loadExistingData();
    }
  }, [isOpen, patientId]);

  const loadExistingData = async () => {
    try {
      const records = await apiService.getMedicalRecords(patientId);
      if (records && records.length > 0) {
        const latestRecord = records[0];
        // Populate form with latest record data
        setClinicalHistory(prev => ({
          ...prev,
          chiefComplaint: latestRecord.chief_complaint || '',
          historyOfPresentIllness: latestRecord.history_of_present_illness || '',
        }));
        setProgress(prev => ({
          ...prev,
          assessment: latestRecord.assessment || '',
          plan: latestRecord.plan || '',
        }));
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleClinicalHistoryChange = (field: keyof ClinicalHistoryData, value: string) => {
    setClinicalHistory(prev => ({ ...prev, [field]: value }));
  };

  const handlePhysicalExamChange = (field: keyof PhysicalExamData, value: any) => {
    setPhysicalExam(prev => ({ ...prev, [field]: value }));
  };

  const handleProgressChange = (field: keyof ProgressData, value: string) => {
    setProgress(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setPhysicalExam(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value }
    }));
  };

  const calculateBMI = () => {
    const weightKg = parseFloat(physicalExam.vitalSigns.weight);
    const heightM = parseFloat(physicalExam.vitalSigns.height);
    if (weightKg > 0 && heightM > 0) {
      const bmi = weightKg / (heightM * heightM);
      handleVitalSignChange('bmi', bmi.toFixed(1));
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [physicalExam.vitalSigns.weight, physicalExam.vitalSigns.height]);

  const handleSaveMedicalRecord = async () => {
    if (!clinicalHistory.chiefComplaint && !physicalExam.generalAppearance && !progress.assessment) {
      toast.error('Preencha pelo menos um campo da consulta');
      return;
    }

    try {
      setLoading(true);
      
      const recordData = {
        patient_id: patientId,
        doctor_id: 1, // This should come from the current user context
        type: 'consultation',
        title: `Consulta Médica - ${new Date().toLocaleDateString('pt-BR')}`,
        chief_complaint: clinicalHistory.chiefComplaint,
        history_of_present_illness: clinicalHistory.historyOfPresentIllness,
        physical_examination: JSON.stringify(physicalExam),
        assessment: progress.assessment,
        plan: progress.plan,
        notes: progress.followUpInstructions,
        diagnosis: progress.assessment,
        treatment: progress.plan,
        follow_up_instructions: progress.followUpInstructions,
        status: 'draft'
      };

      console.log('Saving medical record with data:', recordData);
      
      const result = await apiService.createMedicalRecord(recordData);
      console.log('Medical record saved successfully:', result);
      
      toast.success('Prontuário salvo com sucesso!');
      onClose();
      
    } catch (error: any) {
      console.error('Error saving medical record:', error);
      
      if (error.response?.status === 422) {
        toast.error('Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos.');
      } else if (error.response?.status === 500) {
        toast.error('Erro interno do servidor. Tente novamente ou reinicie o servidor.');
      } else if (error.response?.status === 404) {
        toast.error('Endpoint não encontrado. Verifique se o servidor foi reiniciado.');
      } else {
        toast.error(`Erro ao salvar prontuário: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      await apiService.generateDocument('report', patientId, {
        patient_name: patientName,
        date: new Date().toLocaleDateString('pt-BR'),
        clinical_history: clinicalHistory,
        physical_exam: physicalExam,
        progress: progress,
        procedures: procedures,
      });
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório. Verifique se o servidor foi reiniciado.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceNote = (transcript: string) => {
    // Add voice note to current active tab
    switch (activeTab) {
      case 'clinical-history':
        setClinicalHistory(prev => ({
          ...prev,
          historyOfPresentIllness: prev.historyOfPresentIllness + '\n\n[Nota de voz]: ' + transcript
        }));
        break;
      case 'physical-exam':
        setPhysicalExam(prev => ({
          ...prev,
          generalAppearance: prev.generalAppearance + '\n\n[Nota de voz]: ' + transcript
        }));
        break;
      case 'progress':
        setProgress(prev => ({
          ...prev,
          followUpInstructions: prev.followUpInstructions + '\n\n[Nota de voz]: ' + transcript
        }));
        break;
    }
    toast.success('Nota de voz adicionada com sucesso!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Prontuário Eletrônico - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 mb-4 flex-shrink-0">
              <TabsTrigger value="clinical-history" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                História Clínica
              </TabsTrigger>
              <TabsTrigger value="physical-exam" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Exame Físico
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Evolução
              </TabsTrigger>
              <TabsTrigger value="procedures" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Procedimentos
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              {/* Clinical History Tab */}
              <TabsContent value="clinical-history" className="space-y-6 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" /> História Clínica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="chiefComplaint">Queixa Principal *</Label>
                      <Textarea
                        id="chiefComplaint"
                        value={clinicalHistory.chiefComplaint}
                        onChange={(e) => handleClinicalHistoryChange('chiefComplaint', e.target.value)}
                        placeholder="Descreva a queixa principal do paciente..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="historyOfPresentIllness">História da Doença Atual</Label>
                      <Textarea
                        id="historyOfPresentIllness"
                        value={clinicalHistory.historyOfPresentIllness}
                        onChange={(e) => handleClinicalHistoryChange('historyOfPresentIllness', e.target.value)}
                        placeholder="Descreva a evolução dos sintomas..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pastMedicalHistory">História Médica Pregressa</Label>
                        <Textarea
                          id="pastMedicalHistory"
                          value={clinicalHistory.pastMedicalHistory}
                          onChange={(e) => handleClinicalHistoryChange('pastMedicalHistory', e.target.value)}
                          placeholder="Doenças anteriores, cirurgias..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="medications">Medicações Atuais</Label>
                        <Textarea
                          id="medications"
                          value={clinicalHistory.medications}
                          onChange={(e) => handleClinicalHistoryChange('medications', e.target.value)}
                          placeholder="Medicamentos em uso..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="allergies">Alergias</Label>
                        <Textarea
                          id="allergies"
                          value={clinicalHistory.allergies}
                          onChange={(e) => handleClinicalHistoryChange('allergies', e.target.value)}
                          placeholder="Alergias conhecidas..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="familyHistory">História Familiar</Label>
                        <Textarea
                          id="familyHistory"
                          value={clinicalHistory.familyHistory}
                          onChange={(e) => handleClinicalHistoryChange('familyHistory', e.target.value)}
                          placeholder="Doenças na família..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="socialHistory">História Social</Label>
                      <Textarea
                        id="socialHistory"
                        value={clinicalHistory.socialHistory}
                        onChange={(e) => handleClinicalHistoryChange('socialHistory', e.target.value)}
                        placeholder="Hábitos, ocupação, estilo de vida..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Physical Exam Tab */}
              <TabsContent value="physical-exam" className="space-y-6 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Sinais Vitais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="pressure">Pressão (mmHg)</Label>
                        <Input 
                          id="pressure" 
                          value={physicalExam.vitalSigns.pressure} 
                          onChange={(e) => handleVitalSignChange('pressure', e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="heartRate">Frequência Cardíaca (bpm)</Label>
                        <Input 
                          id="heartRate" 
                          value={physicalExam.vitalSigns.heartRate} 
                          onChange={(e) => handleVitalSignChange('heartRate', e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="temperature">Temperatura (°C)</Label>
                        <Input 
                          id="temperature" 
                          value={physicalExam.vitalSigns.temperature} 
                          onChange={(e) => handleVitalSignChange('temperature', e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="saturation">Saturação (%)</Label>
                        <Input 
                          id="saturation" 
                          value={physicalExam.vitalSigns.saturation} 
                          onChange={(e) => handleVitalSignChange('saturation', e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input 
                          id="weight" 
                          value={physicalExam.vitalSigns.weight} 
                          onChange={(e) => handleVitalSignChange('weight', e.target.value)} 
                          type="number" 
                          step="0.1" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Altura (m)</Label>
                        <Input 
                          id="height" 
                          value={physicalExam.vitalSigns.height} 
                          onChange={(e) => handleVitalSignChange('height', e.target.value)} 
                          type="number" 
                          step="0.01" 
                        />
                      </div>
                      <div>
                        <Label>IMC</Label>
                        <Input value={physicalExam.vitalSigns.bmi} readOnly className="bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" /> Exame Físico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="generalAppearance">Aspecto Geral</Label>
                      <Textarea
                        id="generalAppearance"
                        value={physicalExam.generalAppearance}
                        onChange={(e) => handlePhysicalExamChange('generalAppearance', e.target.value)}
                        placeholder="Estado geral, consciência, hidratação..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="headNeck">Cabeça e Pescoço</Label>
                        <Textarea
                          id="headNeck"
                          value={physicalExam.headNeck}
                          onChange={(e) => handlePhysicalExamChange('headNeck', e.target.value)}
                          placeholder="Exame da cabeça e pescoço..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardiovascular">Cardiovascular</Label>
                        <Textarea
                          id="cardiovascular"
                          value={physicalExam.cardiovascular}
                          onChange={(e) => handlePhysicalExamChange('cardiovascular', e.target.value)}
                          placeholder="Exame cardiovascular..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="respiratory">Respiratório</Label>
                        <Textarea
                          id="respiratory"
                          value={physicalExam.respiratory}
                          onChange={(e) => handlePhysicalExamChange('respiratory', e.target.value)}
                          placeholder="Exame respiratório..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="abdomen">Abdome</Label>
                        <Textarea
                          id="abdomen"
                          value={physicalExam.abdomen}
                          onChange={(e) => handlePhysicalExamChange('abdomen', e.target.value)}
                          placeholder="Exame abdominal..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="extremities">Extremidades</Label>
                        <Textarea
                          id="extremities"
                          value={physicalExam.extremities}
                          onChange={(e) => handlePhysicalExamChange('extremities', e.target.value)}
                          placeholder="Exame das extremidades..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="neurological">Neurológico</Label>
                        <Textarea
                          id="neurological"
                          value={physicalExam.neurological}
                          onChange={(e) => handlePhysicalExamChange('neurological', e.target.value)}
                          placeholder="Exame neurológico..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" /> Avaliação e Plano
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="assessment">Avaliação/Hipótese Diagnóstica *</Label>
                      <Textarea
                        id="assessment"
                        value={progress.assessment}
                        onChange={(e) => handleProgressChange('assessment', e.target.value)}
                        placeholder="Hipótese diagnóstica principal..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan">Plano Terapêutico *</Label>
                      <Textarea
                        id="plan"
                        value={progress.plan}
                        onChange={(e) => handleProgressChange('plan', e.target.value)}
                        placeholder="Conduta médica, tratamento..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicationsPrescribed">Medicações Prescritas</Label>
                      <Textarea
                        id="medicationsPrescribed"
                        value={progress.medicationsPrescribed}
                        onChange={(e) => handleProgressChange('medicationsPrescribed', e.target.value)}
                        placeholder="Medicamentos prescritos..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proceduresPerformed">Procedimentos Realizados</Label>
                      <Textarea
                        id="proceduresPerformed"
                        value={progress.proceduresPerformed}
                        onChange={(e) => handleProgressChange('proceduresPerformed', e.target.value)}
                        placeholder="Procedimentos realizados na consulta..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="followUpInstructions">Orientações e Retorno</Label>
                      <Textarea
                        id="followUpInstructions"
                        value={progress.followUpInstructions}
                        onChange={(e) => handleProgressChange('followUpInstructions', e.target.value)}
                        placeholder="Orientações para o paciente..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextAppointment">Próxima Consulta</Label>
                      <Input
                        id="nextAppointment"
                        type="date"
                        value={progress.nextAppointment}
                        onChange={(e) => handleProgressChange('nextAppointment', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Procedures Tab */}
              <TabsContent value="procedures" className="space-y-6 pb-4">
                <ExamViewer patientId={patientId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Voice Recorder */}
        <div className="border-t pt-4 flex-shrink-0">
          <VoiceRecorder
            onTranscript={handleVoiceNote}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleGenerateReport} disabled={loading}>
            <Printer className="w-4 h-4 mr-2" /> Gerar Relatório
          </Button>
          <Button onClick={handleSaveMedicalRecord} disabled={loading}>
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Prontuário'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TabbedMedicalRecord;
