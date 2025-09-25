import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Pill, 
  Award, 
  ClipboardList, 
  Receipt, 
  FileCheck, 
  ArrowRight,
  Download,
  Eye,
  Plus,
  Calendar,
  User
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface DocumentType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface RecentDocument {
  id: number;
  type: string;
  patient_name: string;
  generated_at: string;
  status: string;
}

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient?: any;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({ isOpen, onClose, selectedPatient }) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [selectedPatientForDoc, setSelectedPatientForDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'recent'>('generate');

  useEffect(() => {
    if (isOpen) {
      loadDocumentData();
      if (selectedPatient) {
        setSelectedPatientForDoc(selectedPatient);
        setPatientSearch(selectedPatient.full_name || selectedPatient.patient_name || '');
      }
    }
  }, [isOpen, selectedPatient]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      
      const [typesData, recentData] = await Promise.all([
        apiService.getDocumentTypes(),
        apiService.getRecentDocuments()
      ]);
      
      setDocumentTypes(typesData || []);
      setRecentDocuments(recentData || []);
      
    } catch (error) {
      console.error('Error loading document data:', error);
      toast.error('Erro ao carregar dados dos documentos');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      prescription: <Pill className="w-5 h-5" />,
      certificate: <Award className="w-5 h-5" />,
      'file-text': <FileText className="w-5 h-5" />,
      receipt: <Receipt className="w-5 h-5" />,
      'file-check': <FileCheck className="w-5 h-5" />,
      'clipboard-list': <ClipboardList className="w-5 h-5" />,
      'arrow-right': <ArrowRight className="w-5 h-5" />
    };
    return iconMap[iconName] || <FileText className="w-5 h-5" />;
  };

  const getDocumentTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      prescription: 'Receita Médica',
      certificate: 'Atestado Médico',
      report: 'Relatório Médico',
      receipt: 'Recibo',
      declaration: 'Declaração',
      guide: 'Guia de Exame',
      referral: 'Encaminhamento'
    };
    return typeMap[type] || type;
  };

  const handleGenerateDocument = async () => {
    if (!selectedDocumentType || !selectedPatientForDoc) {
      toast.error('Selecione um tipo de documento e um paciente');
      return;
    }

    try {
      setLoading(true);
      
      const documentData = {
        type: selectedDocumentType,
        patient_id: selectedPatientForDoc.patient_id || selectedPatientForDoc.id,
        content: documentContent || `Documento ${getDocumentTypeName(selectedDocumentType)} gerado em ${new Date().toLocaleString('pt-BR')}`
      };
      
      const result = await apiService.generateDocument(documentData);
      
      toast.success(result.message || 'Documento gerado com sucesso!');
      
      // Reset form
      setDocumentContent('');
      setSelectedDocumentType('');
      
      // Reload recent documents
      await loadDocumentData();
      
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Erro ao gerar documento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Gestão de Documentos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'generate' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('generate')}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Documento
            </Button>
            <Button
              variant={activeTab === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recent')}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Documentos Recentes
            </Button>
          </div>

          {activeTab === 'generate' && (
            <div className="space-y-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Seleção de Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patientSearch">Paciente</Label>
                      <Input
                        id="patientSearch"
                        placeholder="Digite o nome do paciente"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                    </div>
                    {selectedPatientForDoc && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">{selectedPatientForDoc.full_name || selectedPatientForDoc.patient_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          CPF: {selectedPatientForDoc.cpf || 'N/A'} | 
                          Telefone: {selectedPatientForDoc.phone || 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tipo de Documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documentTypes.map((docType) => (
                      <div
                        key={docType.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDocumentType === docType.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedDocumentType(docType.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-primary">
                            {getDocumentIcon(docType.icon)}
                          </div>
                          <div>
                            <div className="font-medium">{docType.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {docType.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conteúdo do Documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="documentContent">Conteúdo (opcional)</Label>
                      <Textarea
                        id="documentContent"
                        placeholder="Digite o conteúdo específico do documento..."
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleGenerateDocument}
                      disabled={!selectedDocumentType || !selectedPatientForDoc || loading}
                      className="w-full"
                    >
                      {loading ? 'Gerando...' : 'Gerar Documento'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Carregando...</span>
                    </div>
                  ) : recentDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum documento recente encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="text-primary">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{getDocumentTypeName(doc.type)}</div>
                            <div className="text-sm text-muted-foreground">
                              Paciente: {doc.patient_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Gerado em: {formatDate(doc.generated_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">
                              {doc.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsModal;
