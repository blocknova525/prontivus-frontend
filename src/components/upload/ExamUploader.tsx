import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  Camera,
  Scan,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  category: string;
  description: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

interface ExamUploaderProps {
  patientId: number;
  patientName: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  className?: string;
}

const ExamUploader: React.FC<ExamUploaderProps> = ({
  patientId,
  patientName,
  onUploadComplete,
  className
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const examCategories = [
    { value: 'laboratory', label: 'Laboratório', icon: <Activity className="w-4 h-4" /> },
    { value: 'imaging', label: 'Imagem', icon: <Camera className="w-4 h-4" /> },
    { value: 'pathology', label: 'Anatomia Patológica', icon: <Scan className="w-4 h-4" /> },
    { value: 'cardiology', label: 'Cardiologia', icon: <Activity className="w-4 h-4" /> },
    { value: 'other', label: 'Outros', icon: <FileText className="w-4 h-4" /> }
  ];

  const acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB';
    }

    const allowedTypes = Object.keys(acceptedFileTypes);
    const isValidType = allowedTypes.some(type => file.type.match(type));
    
    if (!isValidType) {
      return 'Tipo de arquivo não suportado. Use: PDF, DOC, DOCX ou imagens';
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        category: selectedCategory || 'other',
        description: description || '',
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  };

  const uploadFiles = async (files: UploadedFile[]) => {
    for (const file of files) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, progress }
                : f
            )
          );
        }

        // Mark as completed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );

        toast.success(`${file.file.name} enviado com sucesso!`);
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'error' }
              : f
          )
        );
        toast.error(`Erro ao enviar ${file.file.name}`);
      }
    }

    // Notify parent component
    const completedFiles = files.filter(f => f.status === 'completed');
    onUploadComplete?.(completedFiles);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info('Arquivo removido');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Enviando</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Upload de Exames - {patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria do Exame</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {examCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o exame..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Enviar Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-gray-300 hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui ou clique para selecionar'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Formatos suportados: PDF, DOC, DOCX, JPG, PNG, GIF
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Tamanho máximo: 10MB por arquivo
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Selecionar arquivos para upload"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Arquivos Enviados ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file.file)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{file.file.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file.size)}</span>
                        <span>•</span>
                        <span>{file.uploadDate.toLocaleString('pt-BR')}</span>
                        <span>•</span>
                        <span>{examCategories.find(c => c.value === file.category)?.label}</span>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    {getStatusBadge(file.status)}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamUploader;
