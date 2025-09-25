import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Stethoscope,
  Save,
  X,
  User,
  Calendar
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  initialData?: {
    anamnese?: string;
    exameFisico?: string;
    hipotese?: string;
    conduta?: string;
    observacoes?: string;
    vitalSigns?: any;
  };
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  initialData
}) => {
  const [formData, setFormData] = useState({
    anamnese: initialData?.anamnese || '',
    exameFisico: initialData?.exameFisico || '',
    hipotese: initialData?.hipotese || '',
    conduta: initialData?.conduta || '',
    observacoes: initialData?.observacoes || '',
    vitalSigns: initialData?.vitalSigns || {
      pressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      bmi: '',
      saturation: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value }
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.vitalSigns.weight);
    const height = parseFloat(formData.vitalSigns.height);
    
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      handleVitalSignChange('bmi', bmi);
    }
  };

  const handleSaveRecord = async () => {
    if (!formData.anamnese && !formData.exameFisico && !formData.hipotese) {
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
        chief_complaint: formData.anamnese,
        history_of_present_illness: formData.anamnese,
        physical_examination: formData.exameFisico,
        assessment: formData.hipotese,
        plan: formData.conduta,
        notes: formData.observacoes,
        diagnosis: formData.hipotese,
        treatment: formData.conduta,
        follow_up_instructions: formData.observacoes,
        status: 'draft'
      };

      console.log('Saving medical record with data:', recordData);
      
      const result = await apiService.createMedicalRecord(recordData);
      console.log('Medical record saved successfully:', result);
      
      toast.success('Prontuário salvo com sucesso!');
      onClose();
      
    } catch (error: any) {
      console.error('Error saving medical record:', error);
      
      // Provide more specific error messages
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
      
      const content = {
        patient_name: patientName,
        date: new Date().toLocaleString('pt-BR'),
        anamnese: formData.anamnese,
        exame_fisico: formData.exameFisico,
        hipotese: formData.hipotese,
        conduta: formData.conduta,
        observacoes: formData.observacoes,
        vital_signs: formData.vitalSigns
      };

      await apiService.generateDocument('report', patientId, content);
      
      toast.success('Relatório médico gerado com sucesso!');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Salvar Consulta Médica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">{patientName}</span>
                <Badge variant="outline">ID: {patientId}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date().toLocaleDateString('pt-BR')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sinais Vitais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="pressure">Pressão Arterial</Label>
                  <Input
                    id="pressure"
                    value={formData.vitalSigns.pressure}
                    onChange={(e) => handleVitalSignChange('pressure', e.target.value)}
                    placeholder="120/80 mmHg"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Frequência Cardíaca</Label>
                  <Input
                    id="heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) => handleVitalSignChange('heartRate', e.target.value)}
                    placeholder="72 bpm"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                    placeholder="36.5°C"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    value={formData.vitalSigns.weight}
                    onChange={(e) => {
                      handleVitalSignChange('weight', e.target.value);
                      calculateBMI();
                    }}
                    placeholder="68 kg"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    value={formData.vitalSigns.height}
                    onChange={(e) => {
                      handleVitalSignChange('height', e.target.value);
                      calculateBMI();
                    }}
                    placeholder="1.65 m"
                  />
                </div>
                <div>
                  <Label htmlFor="bmi">IMC</Label>
                  <Input
                    id="bmi"
                    value={formData.vitalSigns.bmi}
                    onChange={(e) => handleVitalSignChange('bmi', e.target.value)}
                    placeholder="25.0"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="saturation">Saturação</Label>
                  <Input
                    id="saturation"
                    value={formData.vitalSigns.saturation}
                    onChange={(e) => handleVitalSignChange('saturation', e.target.value)}
                    placeholder="98%"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Consulta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="anamnese">Anamnese</Label>
                <Textarea
                  id="anamnese"
                  value={formData.anamnese}
                  onChange={(e) => handleInputChange('anamnese', e.target.value)}
                  placeholder="Descreva os sintomas relatados pelo paciente..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="exameFisico">Exame Físico</Label>
                <Textarea
                  id="exameFisico"
                  value={formData.exameFisico}
                  onChange={(e) => handleInputChange('exameFisico', e.target.value)}
                  placeholder="Achados do exame físico..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hipotese">Hipótese Diagnóstica</Label>
                  <Input
                    id="hipotese"
                    value={formData.hipotese}
                    onChange={(e) => handleInputChange('hipotese', e.target.value)}
                    placeholder="CID-10 ou descrição..."
                  />
                </div>
                <div>
                  <Label htmlFor="conduta">Conduta</Label>
                  <Input
                    id="conduta"
                    value={formData.conduta}
                    onChange={(e) => handleInputChange('conduta', e.target.value)}
                    placeholder="Conduta médica..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button 
              onClick={handleSaveRecord}
              disabled={loading}
              className="medical-button-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Consulta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordModal;
