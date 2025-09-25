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
  Plus, 
  Trash2, 
  Pill,
  Save,
  X
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName 
}) => {
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleSavePrescription = async () => {
    // Validate medications
    const validMedications = medications.filter(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (validMedications.length === 0) {
      toast.error('Adicione pelo menos um medicamento');
      return;
    }

    try {
      setLoading(true);
      
      const prescriptionData = {
        patient_id: patientId,
        medications: validMedications,
        notes: notes,
        issued_date: new Date().toISOString().split('T')[0]
      };

      await apiService.createPrescription(prescriptionData);
      
      toast.success('Receita criada com sucesso!');
      onClose();
      
      // Reset form
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setNotes('');
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Erro ao criar receita');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      setLoading(true);
      
      const content = {
        medications: medications.filter(med => med.name),
        notes: notes,
        patient_name: patientName,
        date: new Date().toLocaleString('pt-BR')
      };

      await apiService.generateDocument('prescription', patientId, content);
      
      toast.success('Receita gerada e salva!');
      
    } catch (error) {
      console.error('Error generating prescription:', error);
      toast.error('Erro ao gerar receita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nova Receita Médica
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
                <Pill className="w-5 h-5 text-primary" />
                <span className="font-medium">{patientName}</span>
                <Badge variant="outline">ID: {patientId}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Medicamentos</CardTitle>
                <Button onClick={addMedication} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Medicamento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medicamento {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`med-name-${index}`}>Nome do Medicamento *</Label>
                      <Input
                        id={`med-name-${index}`}
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Ex: Paracetamol"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`med-dosage-${index}`}>Dosagem *</Label>
                      <Input
                        id={`med-dosage-${index}`}
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="Ex: 500mg"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`med-frequency-${index}`}>Frequência *</Label>
                      <Input
                        id={`med-frequency-${index}`}
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="Ex: 3x ao dia"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`med-duration-${index}`}>Duração *</Label>
                      <Input
                        id={`med-duration-${index}`}
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="Ex: 7 dias"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Instruções especiais, contraindicações, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
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
              onClick={handleGenerateDocument}
              disabled={loading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
            <Button 
              onClick={handleSavePrescription}
              disabled={loading}
              className="medical-button-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Receita'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionModal;
