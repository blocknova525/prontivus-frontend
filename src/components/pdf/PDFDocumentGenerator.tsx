import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Pill, Award, ClipboardList, Receipt, Download, Printer, Eye } from 'lucide-react';
import { pdfService } from '@/services/pdfService';
import PrescriptionTemplate from './PrescriptionTemplate';
import CertificateTemplate from './CertificateTemplate';
import ReportTemplate from './ReportTemplate';
import ExamGuideTemplate from './ExamGuideTemplate';
import ReceiptTemplate from './ReceiptTemplate';
import { toast } from 'sonner';

interface PDFDocumentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  patientCPF: string;
  patientAge: string;
  consultationData?: {
    anamnese: string;
    exameFisico: string;
    hipotese: string;
    conduta: string;
    observacoes: string;
    vitalSigns: any;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

const PDFDocumentGenerator: React.FC<PDFDocumentGeneratorProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientCPF,
  patientAge,
  consultationData,
  medications = []
}) => {
  const [activeTab, setActiveTab] = useState('prescription');
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);

  const handleGenerateDocument = (doc: any) => {
    setGeneratedDoc(doc);
    toast.success('Documento gerado com sucesso!');
  };

  const handleDownload = () => {
    if (generatedDoc) {
      const filename = `${patientName.replace(/\s+/g, '_')}_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfService.downloadPDF(generatedDoc, filename);
      toast.success('Documento baixado com sucesso!');
    }
  };

  const handlePrint = () => {
    if (generatedDoc) {
      pdfService.printPDF(generatedDoc);
      toast.success('Documento enviado para impressão!');
    }
  };

  const handlePreview = () => {
    if (generatedDoc) {
      const filename = `${patientName.replace(/\s+/g, '_')}_${activeTab}_${new Date().toISOString().split('T')[0]}`;
      pdfService.previewPDF(generatedDoc, filename);
      toast.success('Visualizando documento em nova aba!');
    }
  };

  const handleClose = () => {
    setGeneratedDoc(null);
    setActiveTab('prescription');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Gerador de Documentos PDF - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
              <TabsTrigger value="prescription" className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Receita
              </TabsTrigger>
              <TabsTrigger value="certificate" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Atestado
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Relatório
              </TabsTrigger>
              <TabsTrigger value="exam-guide" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Guia Exame
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Recibo
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              <TabsContent value="prescription" className="space-y-4 pb-4">
                <PrescriptionTemplate
                  patientName={patientName}
                  patientCPF={patientCPF}
                  patientAge={patientAge}
                  medications={medications}
                  notes={consultationData?.observacoes}
                  onGenerate={handleGenerateDocument}
                />
              </TabsContent>

              <TabsContent value="certificate" className="space-y-4 pb-4">
                <CertificateTemplate
                  patientName={patientName}
                  patientCPF={patientCPF}
                  patientAge={patientAge}
                  onGenerate={handleGenerateDocument}
                />
              </TabsContent>

              <TabsContent value="report" className="space-y-4 pb-4">
                <ReportTemplate
                  patientName={patientName}
                  patientCPF={patientCPF}
                  patientAge={patientAge}
                  chiefComplaint={consultationData?.anamnese || ''}
                  historyOfPresentIllness={consultationData?.anamnese || ''}
                  physicalExamination={consultationData?.exameFisico || ''}
                  assessment={consultationData?.hipotese || ''}
                  plan={consultationData?.conduta || ''}
                  vitalSigns={consultationData?.vitalSigns || {}}
                  onGenerate={handleGenerateDocument}
                />
              </TabsContent>

              <TabsContent value="exam-guide" className="space-y-4 pb-4">
                <ExamGuideTemplate
                  patientName={patientName}
                  patientCPF={patientCPF}
                  patientAge={patientAge}
                  onGenerate={handleGenerateDocument}
                />
              </TabsContent>

              <TabsContent value="receipt" className="space-y-4 pb-4">
                <ReceiptTemplate
                  patientName={patientName}
                  patientCPF={patientCPF}
                  patientAge={patientAge}
                  onGenerate={handleGenerateDocument}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {generatedDoc ? 'Documento pronto para download/impressão' : 'Configure o documento e clique em gerar'}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            
            {generatedDoc && (
              <>
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFDocumentGenerator;
