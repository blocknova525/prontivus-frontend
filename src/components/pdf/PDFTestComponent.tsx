import React, { useState } from 'react';
import { pdfService } from '@/services/pdfService';

const PDFTestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const testPDFGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Testing PDF generation...');
      
      // Test data
      const testData = {
        patientName: 'João Silva',
        patientCPF: '123.456.789-00',
        patientAge: '35 anos',
        doctorName: 'Dr. Maria Santos',
        doctorCRM: 'CRM 123456',
        clinicName: 'Prontivus',
        clinicAddress: 'Rua das Flores, 123 - Centro',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toLocaleDateString('pt-BR'),
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'A cada 6 horas',
            duration: '7 dias'
          },
          {
            name: 'Ibuprofeno',
            dosage: '400mg',
            frequency: 'A cada 8 horas',
            duration: '5 dias'
          }
        ],
        notes: 'Teste de geração de receita médica.'
      };

      console.log('Test data:', testData);
      
      // Check if pdfService is available
      if (!pdfService) {
        throw new Error('PDF Service não está disponível');
      }

      if (typeof pdfService.generatePrescription !== 'function') {
        throw new Error('Método generatePrescription não está disponível');
      }

      // Generate PDF
      const doc = await pdfService.generatePrescription(testData);
      
      if (!doc) {
        throw new Error('Documento PDF não foi gerado');
      }

      // Test download
      const filename = pdfService.downloadPDF(doc, 'teste_receita');
      
      setSuccess(`PDF gerado com sucesso: ${filename}`);
      console.log('PDF generation test successful');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro: ${errorMessage}`);
      console.error('PDF generation test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const testDependencies = () => {
    try {
      console.log('Testing dependencies...');
      
      // Test jsPDF import
      const jsPDF = require('jspdf');
      console.log('jsPDF imported:', !!jsPDF);
      
      // Test autoTable import
      require('jspdf-autotable');
      console.log('jspdf-autotable imported');
      
      // Test PDF creation
      const doc = new jsPDF();
      console.log('PDF document created:', !!doc);
      
      // Test autoTable function
      const hasAutoTable = typeof doc.autoTable === 'function';
      console.log('autoTable function available:', hasAutoTable);
      
      if (hasAutoTable) {
        setSuccess('Todas as dependências estão funcionando corretamente!');
      } else {
        setError('Função autoTable não está disponível');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro nas dependências: ${errorMessage}`);
      console.error('Dependency test failed:', err);
    }
  };

  const testHeaderBackground = () => {
    try {
      console.log('Testing header background...');
      
      if (!pdfService) {
        throw new Error('PDF Service não está disponível');
      }

      // Generate test header
      const doc = pdfService.generateTestHeader();
      
      if (!doc) {
        throw new Error('Documento de teste não foi gerado');
      }

      // Save the test PDF
      doc.save('teste-header-background.pdf');
      
      setSuccess('Teste de cabeçalho gerado! Arquivo salvo como "teste-header-background.pdf". Verifique se o fundo azul está visível.');
      console.log('Header background test successful');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro no teste de cabeçalho: ${errorMessage}`);
      console.error('Header background test failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Teste de Geração de PDF</h2>
      
      <div className="space-y-4">
        <button
          onClick={testDependencies}
          disabled={isGenerating}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Testar Dependências
        </button>
        
        <button
          onClick={testPDFGeneration}
          disabled={isGenerating}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isGenerating ? 'Gerando PDF...' : 'Testar Geração de PDF'}
        </button>
        
        <button
          onClick={testHeaderBackground}
          disabled={isGenerating}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Testar Cabeçalho Azul
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Sucesso:</strong> {success}
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <p><strong>Informações de Debug:</strong></p>
          <p>• PDF Service: {pdfService ? 'Disponível' : 'Indisponível'}</p>
          <p>• Método generatePrescription: {pdfService?.generatePrescription ? 'Disponível' : 'Indisponível'}</p>
          <p>• jsPDF: {typeof window !== 'undefined' && (window as any).jsPDF ? 'Disponível' : 'Indisponível'}</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTestComponent;
