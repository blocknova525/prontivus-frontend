import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  Search,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  size: number;
  uploadDate: Date;
  category: 'laboratory' | 'imaging' | 'pathology' | 'other';
  status: 'pending' | 'reviewed' | 'abnormal';
  description?: string;
  url?: string;
}

interface ExamViewerProps {
  patientId: number;
  className?: string;
}

const ExamViewer: React.FC<ExamViewerProps> = ({ patientId, className }) => {
  const [exams, setExams] = useState<ExamFile[]>([]);
  const [filteredExams, setFilteredExams] = useState<ExamFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<ExamFile | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockExams: ExamFile[] = [
      {
        id: '1',
        name: 'Hemograma Completo',
        type: 'pdf',
        size: 245760,
        uploadDate: new Date('2024-01-15'),
        category: 'laboratory',
        status: 'reviewed',
        description: 'Hemograma completo com valores dentro da normalidade',
        url: '/mock-exams/hemograma.pdf'
      },
      {
        id: '2',
        name: 'Raio-X Tórax PA',
        type: 'image',
        size: 1024000,
        uploadDate: new Date('2024-01-10'),
        category: 'imaging',
        status: 'reviewed',
        description: 'Raio-X de tórax em PA - sem alterações',
        url: '/mock-exams/raiox-torax.jpg'
      },
      {
        id: '3',
        name: 'Glicemia de Jejum',
        type: 'pdf',
        size: 128000,
        uploadDate: new Date('2024-01-12'),
        category: 'laboratory',
        status: 'abnormal',
        description: 'Glicemia elevada - 126 mg/dL',
        url: '/mock-exams/glicemia.pdf'
      },
      {
        id: '4',
        name: 'Ultrassom Abdominal',
        type: 'pdf',
        size: 512000,
        uploadDate: new Date('2024-01-08'),
        category: 'imaging',
        status: 'reviewed',
        description: 'Ultrassom abdominal total - normal',
        url: '/mock-exams/us-abdominal.pdf'
      },
      {
        id: '5',
        name: 'Biópsia Pele',
        type: 'pdf',
        size: 256000,
        uploadDate: new Date('2024-01-05'),
        category: 'pathology',
        status: 'pending',
        description: 'Biópsia de lesão cutânea - aguardando resultado',
        url: '/mock-exams/biopsia.pdf'
      }
    ];

    setExams(mockExams);
    setFilteredExams(mockExams);
  }, [patientId]);

  useEffect(() => {
    let filtered = exams;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(exam => exam.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exam => exam.status === filterStatus);
    }

    setFilteredExams(filtered);
  }, [exams, searchTerm, filterCategory, filterStatus]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'abnormal':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Revisado</Badge>;
      case 'abnormal':
        return <Badge variant="destructive">Alterado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pendente</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'laboratory':
        return 'Laboratório';
      case 'imaging':
        return 'Imagem';
      case 'pathology':
        return 'Anatomia Patológica';
      case 'other':
        return 'Outros';
      default:
        return category;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewExam = (exam: ExamFile) => {
    setSelectedExam(exam);
    // In a real implementation, this would open the exam in a viewer
    console.log('Viewing exam:', exam);
  };

  const handleDownloadExam = (exam: ExamFile) => {
    // In a real implementation, this would download the file
    console.log('Downloading exam:', exam);
  };

  const handleUploadExam = () => {
    // In a real implementation, this would open a file upload dialog
    console.log('Upload exam for patient:', patientId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Exames do Paciente
            </CardTitle>
            <Button onClick={handleUploadExam} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Exame
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exames..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="w-48">
              <Label htmlFor="category-filter">Categoria</Label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Filtrar por categoria de exame"
              >
                <option value="all">Todas</option>
                <option value="laboratory">Laboratório</option>
                <option value="imaging">Imagem</option>
                <option value="pathology">Anatomia Patológica</option>
                <option value="other">Outros</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Filtrar por status do exame"
              >
                <option value="all">Todos</option>
                <option value="reviewed">Revisados</option>
                <option value="abnormal">Alterados</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {filteredExams.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum exame encontrado</p>
                  <p className="text-sm">Use os filtros ou adicione novos exames</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getFileIcon(exam.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{exam.name}</h4>
                          {getStatusIcon(exam.status)}
                          {getStatusBadge(exam.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exam.uploadDate.toLocaleDateString('pt-BR')}
                          </span>
                          <span>{formatFileSize(exam.size)}</span>
                          <span>{getCategoryLabel(exam.category)}</span>
                        </div>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewExam(exam)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadExam(exam)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Exam Detail Modal */}
      {selectedExam && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getFileIcon(selectedExam.type)}
              {selectedExam.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExam(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data do Exame</Label>
                  <p className="text-sm">{selectedExam.uploadDate.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <p className="text-sm">{getCategoryLabel(selectedExam.category)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedExam.status)}
                    {getStatusBadge(selectedExam.status)}
                  </div>
                </div>
                <div>
                  <Label>Tamanho</Label>
                  <p className="text-sm">{formatFileSize(selectedExam.size)}</p>
                </div>
              </div>
              
              {selectedExam.description && (
                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedExam.description}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => handleViewExam(selectedExam)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar Exame
                </Button>
                <Button variant="outline" onClick={() => handleDownloadExam(selectedExam)}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Arquivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamViewer;
