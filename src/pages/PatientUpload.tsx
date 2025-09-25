import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  Camera,
  Scan
} from 'lucide-react';
import ExamUploader from '@/components/upload/ExamUploader';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface PatientInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
}

interface UploadedExam {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  description: string;
  uploadDate: Date;
  status: 'pending' | 'reviewed' | 'abnormal';
  doctorNotes?: string;
  url?: string;
}

const PatientUpload = () => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [uploadedExams, setUploadedExams] = useState<UploadedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');

  // Mock data for demonstration
  useEffect(() => {
    const mockPatient: PatientInfo = {
      id: 1,
      name: 'Maria Santos Silva',
      email: 'maria@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '1980-05-15'
    };

    const mockExams: UploadedExam[] = [
      {
        id: '1',
        fileName: 'Hemograma_Completo.pdf',
        fileType: 'application/pdf',
        fileSize: 245760,
        category: 'laboratory',
        description: 'Hemograma completo solicitado pelo Dr. João Silva',
        uploadDate: new Date('2024-01-15'),
        status: 'reviewed',
        doctorNotes: 'Valores dentro da normalidade',
        url: '/mock-exams/hemograma.pdf'
      },
      {
        id: '2',
        fileName: 'RaioX_Torax.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024000,
        category: 'imaging',
        description: 'Raio-X de tórax em PA',
        uploadDate: new Date('2024-01-10'),
        status: 'reviewed',
        doctorNotes: 'Sem alterações significativas',
        url: '/mock-exams/raiox-torax.jpg'
      },
      {
        id: '3',
        fileName: 'Glicemia_Jejum.pdf',
        fileType: 'application/pdf',
        fileSize: 128000,
        category: 'laboratory',
        description: 'Glicemia de jejum',
        uploadDate: new Date('2024-01-12'),
        status: 'abnormal',
        doctorNotes: 'Valor elevado - 126 mg/dL. Recomendo reavaliação',
        url: '/mock-exams/glicemia.pdf'
      },
      {
        id: '4',
        fileName: 'Ultrassom_Abdominal.pdf',
        fileType: 'application/pdf',
        fileSize: 512000,
        category: 'imaging',
        description: 'Ultrassom abdominal total',
        uploadDate: new Date('2024-01-08'),
        status: 'pending',
        url: '/mock-exams/us-abdominal.pdf'
      }
    ];

    setPatientInfo(mockPatient);
    setUploadedExams(mockExams);
    setLoading(false);
  }, []);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laboratory':
        return <Activity className="w-4 h-4" />;
      case 'imaging':
        return <Camera className="w-4 h-4" />;
      case 'pathology':
        return <Scan className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
      case 'cardiology':
        return 'Cardiologia';
      case 'other':
        return 'Outros';
      default:
        return category;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadComplete = (files: any[]) => {
    toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
    // In a real implementation, this would refresh the exam list
  };

  const handleDownloadExam = (exam: UploadedExam) => {
    // In a real implementation, this would download the file
    console.log('Downloading exam:', exam);
    toast.info('Download iniciado');
  };

  const handleViewExam = (exam: UploadedExam) => {
    // In a real implementation, this would open the exam in a viewer
    console.log('Viewing exam:', exam);
    toast.info('Visualizando exame');
  };

  if (loading) {
    return (
      <AppLayout title="Portal do Paciente" subtitle="Upload de exames">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!patientInfo) {
    return (
      <AppLayout title="Portal do Paciente" subtitle="Upload de exames">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Paciente não encontrado</h3>
            <p className="text-muted-foreground">Verifique suas credenciais de acesso.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Portal do Paciente" subtitle="Upload de exames médicos">
      <div className="space-y-6">
        {/* Patient Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/api/placeholder/64/64" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {patientInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{patientInfo.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-2">
                  <div>
                    <span className="font-medium">Email:</span> {patientInfo.email}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {patientInfo.phone}
                  </div>
                  <div>
                    <span className="font-medium">CPF:</span> {patientInfo.cpf}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Enviar Exames
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Meus Exames
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <ExamUploader
              patientId={patientInfo.id}
              patientName={patientInfo.name}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Histórico de Exames ({uploadedExams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          {getFileIcon(exam.fileType)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{exam.fileName}</h4>
                            {getStatusIcon(exam.status)}
                            {getStatusBadge(exam.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(exam.category)}
                              {getCategoryLabel(exam.category)}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(exam.fileSize)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {exam.uploadDate.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {exam.description}
                          </p>
                          
                          {exam.doctorNotes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              <span className="font-medium text-primary">Observação do médico:</span>
                              <p className="text-muted-foreground">{exam.doctorNotes}</p>
                            </div>
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
                  
                  {uploadedExams.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum exame enviado ainda</p>
                      <p className="text-sm">Use a aba "Enviar Exames" para fazer upload</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PatientUpload;
