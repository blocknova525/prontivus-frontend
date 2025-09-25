import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Eye, 
  Printer, 
  Search,
  Calendar,
  User,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  fileName: string;
  patientName: string;
  documentType: 'prescription' | 'certificate' | 'report' | 'exam-guide' | 'receipt';
  createdAt: Date;
  status: 'generated' | 'downloaded' | 'printed';
  size: number;
  url?: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        fileName: 'Maria_Santos_Silva_prescription_2024-01-15.pdf',
        patientName: 'Maria Santos Silva',
        documentType: 'prescription',
        createdAt: new Date('2024-01-15T10:30:00'),
        status: 'generated',
        size: 245760,
        url: '/mock-documents/prescription_1.pdf'
      },
      {
        id: '2',
        fileName: 'Joao_Oliveira_certificate_2024-01-14.pdf',
        patientName: 'João Oliveira',
        documentType: 'certificate',
        createdAt: new Date('2024-01-14T14:20:00'),
        status: 'downloaded',
        size: 189440,
        url: '/mock-documents/certificate_1.pdf'
      },
      {
        id: '3',
        fileName: 'Ana_Costa_report_2024-01-13.pdf',
        patientName: 'Ana Costa',
        documentType: 'report',
        createdAt: new Date('2024-01-13T09:15:00'),
        status: 'printed',
        size: 512000,
        url: '/mock-documents/report_1.pdf'
      },
      {
        id: '4',
        fileName: 'Pedro_Ferreira_exam-guide_2024-01-12.pdf',
        patientName: 'Pedro Ferreira',
        documentType: 'exam-guide',
        createdAt: new Date('2024-01-12T16:45:00'),
        status: 'generated',
        size: 128000,
        url: '/mock-documents/exam_guide_1.pdf'
      },
      {
        id: '5',
        fileName: 'Maria_Santos_Silva_receipt_2024-01-11.pdf',
        patientName: 'Maria Santos Silva',
        documentType: 'receipt',
        createdAt: new Date('2024-01-11T11:30:00'),
        status: 'downloaded',
        size: 156000,
        url: '/mock-documents/receipt_1.pdf'
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'prescription':
        return 'Receita';
      case 'certificate':
        return 'Atestado';
      case 'report':
        return 'Relatório';
      case 'exam-guide':
        return 'Guia de Exame';
      case 'receipt':
        return 'Recibo';
      default:
        return type;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'downloaded':
        return <Download className="w-4 h-4 text-green-600" />;
      case 'printed':
        return <Printer className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Gerado</Badge>;
      case 'downloaded':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Baixado</Badge>;
      case 'printed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Impresso</Badge>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (document: Document) => {
    // In a real implementation, this would download the actual file
    console.log('Downloading document:', document);
    toast.success(`Baixando ${document.fileName}...`);
    
    // Update status
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'downloaded' as const }
          : doc
      )
    );
  };

  const handleView = (document: Document) => {
    // In a real implementation, this would open the document in a viewer
    console.log('Viewing document:', document);
    toast.info(`Visualizando ${document.fileName}...`);
  };

  const handlePrint = (document: Document) => {
    // In a real implementation, this would send to printer
    console.log('Printing document:', document);
    toast.success(`Enviando ${document.fileName} para impressão...`);
    
    // Update status
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'printed' as const }
          : doc
      )
    );
  };

  if (loading) {
    return (
      <AppLayout title="Documentos" subtitle="Gestão de documentos gerados">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Documentos" subtitle="Gestão de documentos gerados">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Filtrar por tipo de documento"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="prescription">Receitas</option>
                    <option value="certificate">Atestados</option>
                    <option value="report">Relatórios</option>
                    <option value="exam-guide">Guias de Exame</option>
                    <option value="receipt">Recibos</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total de documentos</div>
                  <div className="text-2xl font-bold text-primary">{documents.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Baixados hoje</div>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'downloaded').length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Documentos Gerados ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      {getDocumentTypeIcon(document.documentType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{document.fileName}</h4>
                        {getStatusIcon(document.status)}
                        {getStatusBadge(document.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {document.patientName}
                        </span>
                        <span>•</span>
                        <span>{getDocumentTypeLabel(document.documentType)}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {document.createdAt.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(document)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(document)}
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum documento encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Onde encontrar os documentos?</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Downloads:</strong> Os documentos baixados são salvos na pasta Downloads do seu computador</p>
                  <p><strong>Nomes dos arquivos:</strong> Seguem o padrão: NomePaciente_TipoDocumento_Data.pdf</p>
                  <p><strong>Exemplo:</strong> Maria_Santos_Silva_prescription_2024-01-15.pdf</p>
                  <p><strong>Localização:</strong> Geralmente em C:\Users\[SeuUsuario]\Downloads\ (Windows) ou ~/Downloads/ (Mac/Linux)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Documents;
