import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrescriptionPDFTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testPrescriptionPDF = async () => {
    try {
      setStatus('Testing prescription PDF generation...');
      setError('');
      
      // Import PDF service
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generatePrescription) {
        throw new Error('PDF service not available or generatePrescription method missing');
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
        medications: [
          {
            name: 'Losartana',
            dosage: '50mg',
            frequency: '1x ao dia',
            duration: '30 dias'
          },
          {
            name: 'Hidroclorotiazida',
            dosage: '25mg',
            frequency: '1x ao dia',
            duration: '30 dias'
          }
        ],
        notes: 'Tomar pela manhã, controlar pressão arterial'
      };
      
      console.log('Test prescription data prepared:', testData);
      
      // Generate PDF
      const doc = await pdfService.generatePrescription(testData);
      console.log('Prescription PDF document generated:', doc);
      
      // Save PDF
      doc.save('teste_receita.pdf');
      console.log('Prescription PDF saved successfully');
      
      setStatus('✅ PDF da receita gerado com sucesso! Arquivo salvo como "teste_receita.pdf"');
      
    } catch (err: any) {
      console.error('Error in prescription PDF test:', err);
      setError(`❌ Erro: ${err.message}`);
      setStatus('');
    }
  };

  const testMultiplePrescriptionsPDF = async () => {
    try {
      setStatus('Testing multiple prescriptions PDF generation...');
      setError('');
      
      // Import PDF service
      const pdfModule = await import('@/services/pdfService');
      const pdfService = pdfModule.pdfService || pdfModule.default;
      console.log('PDF service loaded:', pdfService);
      
      if (!pdfService || !pdfService.generatePrescription) {
        throw new Error('PDF service not available or generatePrescription method missing');
      }
      
      // Test data with multiple prescriptions
      const allMedications = [
        {
          name: 'Losartana',
          dosage: '50mg',
          frequency: '1x ao dia',
          duration: '30 dias'
        },
        {
          name: 'Hidroclorotiazida',
          dosage: '25mg',
          frequency: '1x ao dia',
          duration: '30 dias'
        },
        {
          name: 'Metformina',
          dosage: '500mg',
          frequency: '2x ao dia',
          duration: '30 dias'
        }
      ];
      
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
          { id: 1, issued_date: '2024-01-20', notes: 'Tomar pela manhã, controlar pressão arterial' },
          { id: 2, issued_date: '2024-01-15', notes: 'Tomar com as refeições' }
        ],
        medications: allMedications,
        notes: 'Receitas médicas completas - Total: 2 receitas\n\n2024-01-20: Tomar pela manhã, controlar pressão arterial\n2024-01-15: Tomar com as refeições'
      };
      
      console.log('Multiple prescriptions test data prepared:', testData);
      
      // Generate PDF
      const doc = await pdfService.generatePrescription(testData);
      console.log('Multiple prescriptions PDF document generated:', doc);
      
      // Save PDF
      doc.save('teste_receitas_multiplas.pdf');
      console.log('Multiple prescriptions PDF saved successfully');
      
      setStatus('✅ PDF de múltiplas receitas gerado com sucesso! Arquivo salvo como "teste_receitas_multiplas.pdf"');
      
    } catch (err: any) {
      console.error('Error in multiple prescriptions PDF test:', err);
      setError(`❌ Erro: ${err.message}`);
      setStatus('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Geração de PDF - Receitas Médicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testPrescriptionPDF} className="w-full">
            Testar PDF de Receita Individual
          </Button>
          <Button onClick={testMultiplePrescriptionsPDF} variant="outline" className="w-full">
            Testar PDF de Múltiplas Receitas
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
            <li>Clique nos botões acima para testar a geração de PDF de receitas</li>
            <li>Os arquivos serão baixados automaticamente</li>
            <li>Verifique o console do navegador para logs detalhados</li>
            <li>Se houver erro, a mensagem será exibida acima</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionPDFTest;
