import React, { useState } from 'react';
import { pdfService, CertificateData } from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CertificateTemplateProps {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  onGenerate: (doc: any) => void;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  patientName,
  patientCPF,
  patientAge,
  onGenerate
}) => {
  const [certificateType, setCertificateType] = useState<'medical' | 'sick_leave' | 'fitness' | 'attendance' | 'accompaniment'>('medical');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [restrictions, setRestrictions] = useState('');

  const generateCertificate = async () => {
    const certificateData: CertificateData = {
      patientName,
      patientCPF,
      patientAge,
      doctorName: 'Dr. João Silva',
      doctorCRM: 'CRM 123456',
      clinicName: 'Prontivus',
      clinicAddress: 'Rua das Flores, 123 - Centro',
      clinicPhone: '(11) 99999-9999',
      date: new Date().toLocaleDateString('pt-BR'),
      certificateType,
      reason: reason || 'Atestado médico conforme consulta',
      duration,
      restrictions
    };

    const doc = await pdfService.generateCertificate(certificateData);
    onGenerate(doc);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">Atestado Médico</h3>
        <p className="text-sm text-muted-foreground">
          Gerar atestado com formatação profissional
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
          <Label htmlFor="certificateType">Tipo de Atestado</Label>
          <Select value={certificateType} onValueChange={(value: any) => setCertificateType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de atestado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical">Atestado Médico</SelectItem>
              <SelectItem value="sick_leave">Atestado de Afastamento</SelectItem>
              <SelectItem value="fitness">Atestado de Aptidão para Atividades Físicas / Piscina</SelectItem>
              <SelectItem value="attendance">Declaração de Comparecimento</SelectItem>
              <SelectItem value="accompaniment">Declaração de Acompanhamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reason">Motivo/Justificativa</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva o motivo do atestado..."
            rows={3}
          />
        </div>

        {certificateType === 'sick_leave' && (
          <div>
            <Label htmlFor="duration">Período de Afastamento</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 7 dias, 15 dias, 1 mês"
            />
          </div>
        )}

        {certificateType === 'fitness' && (
          <div>
            <Label htmlFor="restrictions">Restrições</Label>
            <Textarea
              id="restrictions"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Descreva as restrições para atividades físicas..."
              rows={2}
            />
          </div>
        )}

        {(certificateType === 'attendance' || certificateType === 'accompaniment') && (
          <div className="space-y-2">
            <div>
              <Label htmlFor="duration">Horário de Início</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 09:00"
              />
            </div>
            <div>
              <Label htmlFor="restrictions">Horário de Fim</Label>
              <Input
                id="restrictions"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="Ex: 10:00"
              />
            </div>
          </div>
        )}
      </div>

      <Button onClick={generateCertificate} className="w-full">
        Gerar Atestado PDF
      </Button>
    </div>
  );
};

export default CertificateTemplate;
