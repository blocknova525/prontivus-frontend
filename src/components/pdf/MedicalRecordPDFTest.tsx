import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MedicalRecordPDFTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testMedicalRecordPDF = async () => {
    try {
      setStatus('Testing medical record PDF generation...');
      setError('');
      
      // Import PDF service
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generateReport) {
        throw new Error('PDF service not available or generateReport method missing');
      }
      
      // Test data
      const testData = {
        patientName: 'Ana Costa',
        patientCPF: '123.456.789-00',
        patientAge: '39',
        doctorName: 'Dr. João Silva',
        doctorCRM: '12345',
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: '2024-01-20',
        content: { test: 'data' },
        chiefComplaint: 'Consulta de Rotina',
        historyOfPresentIllness: 'Check-up geral',
        physicalExamination: 'Exames laboratoriais solicitados',
        assessment: 'Check-up geral',
        plan: 'Exames laboratoriais solicitados',
        vitalSigns: { 
          pressure: '120/80', 
          temperature: '36.5°C', 
          weight: '65kg', 
          heartRate: '72 bpm', 
          saturation: '98%', 
          height: '165cm' 
        },
        notes: 'Paciente apresentou melhora significativa'
      };
      
      console.log('Test data prepared:', testData);
      
      // Generate PDF
      const doc = await pdfService.generateReport(testData);
      console.log('PDF document generated:', doc);
      
      // Save PDF
      doc.save('teste_prontuario.pdf');
      console.log('PDF saved successfully');
      
      setStatus('✅ PDF gerado com sucesso! Arquivo salvo como "teste_prontuario.pdf"');
      
    } catch (err: any) {
      console.error('Error in PDF test:', err);
      setError(`❌ Erro: ${err.message}`);
      setStatus('');
    }
  };

  const testCompleteMedicalRecordsPDF = async () => {
    try {
      setStatus('Testing complete medical records PDF generation...');
      setError('');
      
      // Import PDF service
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generateReport) {
        throw new Error('PDF service not available or generateReport method missing');
      }
      
      // Test data with multiple records
      const testData = {
        patientName: 'Ana Costa',
        patientCPF: '123.456.789-00',
        patientAge: '39',
        doctorName: 'Dr. João Silva',
        doctorCRM: '12345',
        clinicName: 'Prontivus',
        clinicAddress: 'São Paulo, SP',
        clinicPhone: '(11) 99999-9999',
        date: '2024-01-20',
        content: [
          { id: 1, date: '2024-01-20', type: 'Consulta de Rotina', diagnosis: 'Check-up geral' },
          { id: 2, date: '2024-01-15', type: 'Consulta de Especialidade', diagnosis: 'Hipertensão arterial leve' }
        ],
        chiefComplaint: 'Histórico Completo',
        historyOfPresentIllness: 'Prontuário completo com 2 registros médicos',
        physicalExamination: '2024-01-20: Consulta de Rotina - Check-up geral\n2024-01-15: Consulta de Especialidade - Hipertensão arterial leve',
        assessment: 'Resumo de todos os atendimentos',
        plan: 'Continuidade do tratamento conforme orientações médicas',
        vitalSigns: { 
          pressure: 'Conforme registros individuais', 
          temperature: 'Conforme registros individuais', 
          weight: 'Conforme registros individuais', 
          heartRate: 'Conforme registros individuais', 
          saturation: 'Conforme registros individuais', 
          height: 'Conforme registros individuais' 
        },
        notes: 'Total de 2 consultas registradas'
      };
      
      console.log('Complete test data prepared:', testData);
      
      // Generate PDF
      const doc = await pdfService.generateReport(testData);
      console.log('Complete PDF document generated:', doc);
      
      // Save PDF
      doc.save('teste_prontuario_completo.pdf');
      console.log('Complete PDF saved successfully');
      
      setStatus('✅ PDF completo gerado com sucesso! Arquivo salvo como "teste_prontuario_completo.pdf"');
      
    } catch (err: any) {
      console.error('Error in complete PDF test:', err);
      setError(`❌ Erro: ${err.message}`);
      setStatus('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Geração de PDF - Prontuário Médico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testMedicalRecordPDF} className="w-full">
            Testar PDF de Registro Individual
          </Button>
          <Button onClick={testCompleteMedicalRecordsPDF} variant="outline" className="w-full">
            Testar PDF de Prontuário Completo
          </Button>
        </div>
        
        {status && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{status}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Clique nos botões acima para testar a geração de PDF</li>
            <li>Os arquivos serão baixados automaticamente</li>
            <li>Verifique o console do navegador para logs detalhados</li>
            <li>Se houver erro, a mensagem será exibida acima</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordPDFTest;
