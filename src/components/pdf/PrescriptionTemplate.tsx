import React from 'react';
import { pdfService, PrescriptionData } from '@/services/pdfService';

interface PrescriptionTemplateProps {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes?: string;
  onGenerate: (doc: any) => void;
}

const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({
  patientName,
  patientCPF,
  patientAge,
  medications,
  notes,
  onGenerate
}) => {
  const generatePrescription = async () => {
    try {
      console.log('Generating prescription for:', patientName);
      
      // Validate required data
      if (!patientName || !patientCPF || !patientAge) {
        throw new Error('Dados do paciente incompletos. Verifique nome, CPF e idade.');
      }

      // Ensure we have at least one medication or show a message
      const medicationsToUse = medications.length === 0 
        ? [{
            name: 'Medicação não especificada',
            dosage: 'Conforme orientação médica',
            frequency: 'Conforme orientação médica',
            duration: 'Conforme orientação médica'
          }]
        : medications;
      
      console.log('Using medications:', medicationsToUse);
      
      const prescriptionData: PrescriptionData = {
        patientName: patientName.trim(),
        patientCPF: patientCPF.trim(),
        patientAge: patientAge.trim(),
        doctorName: 'Dr. João Silva',
        doctorCRM: 'CRM 123456',
        clinicName: 'Prontivus',
        clinicAddress: 'Rua das Flores, 123 - Centro',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toLocaleDateString('pt-BR'),
        medications: medicationsToUse,
        notes: notes || 'Receita médica conforme consulta realizada.'
      };

      console.log('Prescription data:', prescriptionData);
      
      // Check if pdfService is available
      if (!pdfService || typeof pdfService.generatePrescription !== 'function') {
        throw new Error('Serviço de PDF não está disponível. Verifique as dependências.');
      }
      
      const doc = await pdfService.generatePrescription(prescriptionData);
      
      if (!doc) {
        throw new Error('Falha ao gerar documento PDF.');
      }
      
      onGenerate(doc);
      console.log('Prescription generated successfully');
      
    } catch (error) {
      console.error('Error generating prescription:', error);
      
      // More specific error messages
      let errorMessage = 'Erro ao gerar receita médica.';
      
      if (error instanceof Error) {
        if (error.message.includes('Dados do paciente incompletos')) {
          errorMessage = error.message;
        } else if (error.message.includes('Serviço de PDF')) {
          errorMessage = 'Erro no serviço de PDF. Verifique se as dependências estão instaladas.';
        } else if (error.message.includes('Falha ao gerar documento')) {
          errorMessage = 'Falha ao gerar o documento PDF. Tente novamente.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">Receita Médica</h3>
        <p className="text-sm text-muted-foreground">
          Gerar receita com formatação profissional
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
        <h4 className="font-medium mb-2">Medicações ({medications.length})</h4>
        {medications.length > 0 ? (
          <div className="space-y-2">
            {medications.map((med, index) => (
              <div key={index} className="text-sm border-l-2 border-primary pl-3">
                <p><strong>{med.name}</strong></p>
                <p>{med.dosage} - {med.frequency} - {med.duration}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Nenhuma medicação especificada. Será gerada uma receita padrão.
          </div>
        )}
      </div>

      {notes && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Observações</h4>
          <p className="text-sm">{notes}</p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={generatePrescription}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Gerar Receita PDF
        </button>
        
        {/* Debug information */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <p><strong>Debug Info:</strong></p>
          <p>• Paciente: {patientName || 'Não informado'}</p>
          <p>• CPF: {patientCPF || 'Não informado'}</p>
          <p>• Idade: {patientAge || 'Não informado'}</p>
          <p>• Medicações: {medications.length}</p>
          <p>• PDF Service: {pdfService ? 'Disponível' : 'Indisponível'}</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;
