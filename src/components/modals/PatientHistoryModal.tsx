import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  History, 
  Calendar,
  User,
  Stethoscope,
  FileText,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface MedicalRecord {
  id: number;
  date: string;
  type: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  doctor_name: string;
}

interface Prescription {
  id: number;
  issued_date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  status: string;
  doctor_name: string;
}

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName 
}) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'records' | 'prescriptions'>('all');

  useEffect(() => {
    if (isOpen) {
      loadPatientHistory();
    }
  }, [isOpen, patientId]);

  const loadPatientHistory = async () => {
    try {
      setLoading(true);
      
      const [recordsData, prescriptionsData] = await Promise.all([
        apiService.getMedicalRecords(patientId),
        apiService.getPrescriptions(patientId)
      ]);
      
      setMedicalRecords(recordsData || []);
      setPrescriptions(prescriptionsData || []);
      
    } catch (error) {
      console.error('Error loading patient history:', error);
      toast.error('Erro ao carregar histórico do paciente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const filteredRecords = medicalRecords.filter(record =>
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medications.some(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRecord = (record: MedicalRecord) => {
    // In a real implementation, this would open a detailed view
    toast.info(`Visualizando consulta de ${formatDate(record.date)}`);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    // In a real implementation, this would open a detailed view
    toast.info(`Visualizando receita de ${formatDate(prescription.issued_date)}`);
  };

  const handleDownloadRecord = (record: MedicalRecord) => {
    // In a real implementation, this would generate and download a PDF
    toast.info(`Baixando relatório de ${formatDate(record.date)}`);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    // In a real implementation, this would generate and download a PDF
    toast.info(`Baixando receita de ${formatDate(prescription.issued_date)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico Médico - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">{patientName}</span>
                <Badge variant="outline">ID: {patientId}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {medicalRecords.length + prescriptions.length} registros
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por diagnóstico, tratamento, medicamento..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="filter">Filtrar por</Label>
                  <select
                    id="filter"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Filtrar por tipo de registro"
                  >
                    <option value="all">Todos</option>
                    <option value="records">Consultas</option>
                    <option value="prescriptions">Receitas</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Medical Records */}
              {(filterType === 'all' || filterType === 'records') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      Consultas Médicas ({filteredRecords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredRecords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma consulta encontrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredRecords.map((record) => (
                          <div key={record.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(record.date)}
                                  </Badge>
                                  <Badge variant="secondary">{record.type}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Dr(a). {record.doctor_name}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">Diagnóstico: {record.diagnosis}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Tratamento: {record.treatment}
                                  </p>
                                  {record.notes && (
                                    <p className="text-sm text-muted-foreground">
                                      Observações: {record.notes.substring(0, 100)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewRecord(record)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadRecord(record)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Prescriptions */}
              {(filterType === 'all' || filterType === 'prescriptions') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Receitas Médicas ({filteredPrescriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredPrescriptions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma receita encontrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPrescriptions.map((prescription) => (
                          <div key={prescription.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(prescription.issued_date)}
                                  </Badge>
                                  <Badge 
                                    variant={prescription.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {prescription.status === 'active' ? 'Ativa' : 'Inativa'}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Dr(a). {prescription.doctor_name}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">Medicamentos:</p>
                                  <div className="space-y-1">
                                    {prescription.medications.map((med, index) => (
                                      <p key={index} className="text-sm text-muted-foreground">
                                        • {med.name} {med.dosage} - {med.frequency} por {med.duration}
                                      </p>
                                    ))}
                                  </div>
                                  {prescription.notes && (
                                    <p className="text-sm text-muted-foreground">
                                      Observações: {prescription.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewPrescription(prescription)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadPrescription(prescription)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryModal;
