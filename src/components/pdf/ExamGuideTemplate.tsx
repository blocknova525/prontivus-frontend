import React, { useState } from 'react';
import { pdfService, ExamGuideData } from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ExamGuideTemplateProps {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  onGenerate: (doc: any) => void;
}

const ExamGuideTemplate: React.FC<ExamGuideTemplateProps> = ({
  patientName,
  patientCPF,
  patientAge,
  onGenerate
}) => {
  const [examType, setExamType] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [preparation, setPreparation] = useState('');
  const [fasting, setFasting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const generateExamGuide = async () => {
    try {
      // Validate required fields
      if (!examType.trim()) {
        alert('Por favor, informe o tipo de exame.');
        return;
      }

      if (!examDescription.trim()) {
        alert('Por favor, informe a descrição do exame.');
        return;
      }

      const examGuideData: ExamGuideData = {
        patientName,
        patientCPF,
        patientAge,
        doctorName: 'Dr. João Silva',
        doctorCRM: 'CRM 123456',
        clinicName: 'Prontivus',
        clinicAddress: 'Rua das Flores, 123 - Centro',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toLocaleDateString('pt-BR'),
        examType: examType.trim(),
        examDescription: examDescription.trim(),
        preparation: preparation.trim() || undefined,
        fasting,
        specialInstructions: specialInstructions.trim() || undefined
      };

      const doc = await pdfService.generateExamGuide(examGuideData);
      onGenerate(doc);
    } catch (error) {
      console.error('Error generating exam guide:', error);
      alert('Erro ao gerar guia de exame: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">Guia de Exame</h3>
        <p className="text-sm text-muted-foreground">
          Gerar guia para solicitação de exames
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Dados do Paciente</h4>
        <div className="text-sm space-y-1">
          <p><strong>Nome:</strong> {patientName}</p>
          <p><strong>CPF:</strong> {patientCPF}</p>
          <p><strong>Idade:</strong> {patientAge}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="examType">Tipo de Exame</Label>
          <Input
            id="examType"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            placeholder="Ex: Hemograma, Raio-X, Ultrassom..."
          />
        </div>

        <div>
          <Label htmlFor="examDescription">Descrição do Exame</Label>
          <Textarea
            id="examDescription"
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
            placeholder="Descreva o exame solicitado..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="preparation">Preparo Necessário</Label>
          <Textarea
            id="preparation"
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
            placeholder="Descreva o preparo necessário..."
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="fasting"
            checked={fasting}
            onCheckedChange={(checked) => setFasting(checked as boolean)}
          />
          <Label htmlFor="fasting">Requer jejum</Label>
        </div>

        <div>
          <Label htmlFor="specialInstructions">Instruções Especiais</Label>
          <Textarea
            id="specialInstructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Instruções especiais para o exame..."
            rows={2}
          />
        </div>
      </div>

      <Button onClick={generateExamGuide} className="w-full">
        Gerar Guia de Exame PDF
      </Button>
    </div>
  );
};

export default ExamGuideTemplate;
