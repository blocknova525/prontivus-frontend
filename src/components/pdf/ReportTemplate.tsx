import React from 'react';
import { pdfService, ReportData } from '@/services/pdfService';

interface ReportTemplateProps {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  assessment: string;
  plan: string;
  vitalSigns: any;
  onGenerate: (doc: any) => void;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({
  patientName,
  patientCPF,
  patientAge,
  chiefComplaint,
  historyOfPresentIllness,
  physicalExamination,
  assessment,
  plan,
  vitalSigns,
  onGenerate
}) => {
  const generateReport = async () => {
    try {
      // Provide default content for empty fields
      const reportData: ReportData = {
        patientName,
        patientCPF,
        patientAge,
        doctorName: 'Dr. João Silva',
        doctorCRM: 'CRM 123456',
        clinicName: 'Prontivus',
        clinicAddress: 'Rua das Flores, 123 - Centro',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toLocaleDateString('pt-BR'),
        chiefComplaint: chiefComplaint || 'Não informado',
        historyOfPresentIllness: historyOfPresentIllness || 'Não informado',
        physicalExamination: physicalExamination || 'Não informado',
        assessment: assessment || 'Não informado',
        plan: plan || 'Não informado',
        vitalSigns: vitalSigns || {}
      };

      const doc = await pdfService.generateReport(reportData);
      onGenerate(doc);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">Relatório Médico</h3>
        <p className="text-sm text-muted-foreground">
          Gerar relatório completo da consulta
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

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Sinais Vitais</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><strong>Pressão:</strong> {vitalSigns.pressure}</p>
          <p><strong>Frequência:</strong> {vitalSigns.heartRate}</p>
          <p><strong>Temperatura:</strong> {vitalSigns.temperature}</p>
          <p><strong>Saturação:</strong> {vitalSigns.saturation}</p>
          <p><strong>Peso:</strong> {vitalSigns.weight}</p>
          <p><strong>Altura:</strong> {vitalSigns.height}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="font-medium text-sm mb-1">Queixa Principal</h5>
          <p className="text-sm text-muted-foreground">
            {chiefComplaint || 'Não informado'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="font-medium text-sm mb-1">História da Doença Atual</h5>
          <p className="text-sm text-muted-foreground">
            {historyOfPresentIllness || 'Não informado'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="font-medium text-sm mb-1">Exame Físico</h5>
          <p className="text-sm text-muted-foreground">
            {physicalExamination || 'Não informado'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="font-medium text-sm mb-1">Avaliação</h5>
          <p className="text-sm text-muted-foreground">
            {assessment || 'Não informado'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="font-medium text-sm mb-1">Plano Terapêutico</h5>
          <p className="text-sm text-muted-foreground">
            {plan || 'Não informado'}
          </p>
        </div>
      </div>

      <button
        onClick={generateReport}
        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Gerar Relatório PDF
      </button>
    </div>
  );
};

export default ReportTemplate;
