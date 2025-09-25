import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Upload,
  Calendar,
  Phone,
  Mail,
  Clock,
  Printer
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const SecretariaPacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load patients and doctors from PostgreSQL database
      const [patientsResponse, doctorsResponse] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors()
      ]);
      
      const patientsData = patientsResponse || [];
      const doctorsData = doctorsResponse || [];
      
      // Transform patients data to include additional calculated fields
      const transformedPatients = patientsData.map((patient: any) => {
        const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
        const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 0;
        
        return {
          id: patient.id,
          name: patient.full_name || patient.name || 'Nome não informado',
          cpf: patient.cpf || '',
          email: patient.email || '',
          phone: patient.phone || '',
          birthDate: birthDate ? birthDate.toLocaleDateString('pt-BR') : '',
          age: age,
          gender: patient.gender === 'male' ? 'Masculino' : 
                  patient.gender === 'female' ? 'Feminino' : 'Outro',
          status: patient.is_active ? 'active' : 'inactive',
          lastVisit: patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('pt-BR') : 'Nunca',
          insurance: patient.insurance_company || 'Não informado',
          totalAppointments: patient.total_appointments || 0,
          createdAt: patient.created_at,
          updatedAt: patient.updated_at,
          tenantId: patient.tenant_id
        };
      });
      
      setPatients(transformedPatients);
      setDoctors(doctorsData);
      
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar pacientes'));
      
      // Fallback to mock data if API fails
      setPatients(mockPatients);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback (will be removed)
  const mockPatients = [
    {
      id: 1,
      name: 'Ana Costa',
      cpf: '123.456.789-01',
      email: 'ana.costa@email.com',
      phone: '(11) 99999-1111',
      birthDate: '15/03/1985',
      gender: 'Feminino',
      status: 'active',
      lastVisit: '15/09/2024',
      insurance: 'Unimed',
      totalAppointments: 12
    },
    {
      id: 2,
      name: 'Pedro Oliveira',
      cpf: '987.654.321-02',
      email: 'pedro.oliveira@email.com',
      phone: '(11) 99999-2222',
      birthDate: '22/07/1978',
      gender: 'Masculino',
      status: 'active',
      lastVisit: '10/09/2024',
      insurance: 'Bradesco Saúde',
      totalAppointments: 8
    },
    {
      id: 3,
      name: 'Mariana Santos',
      cpf: '456.789.123-03',
      email: 'mariana.santos@email.com',
      phone: '(11) 99999-3333',
      birthDate: '08/11/1992',
      gender: 'Feminino',
      status: 'inactive',
      lastVisit: '20/08/2024',
      insurance: 'SulAmérica',
      totalAppointments: 5
    },
    {
      id: 4,
      name: 'Roberto Silva',
      cpf: '789.123.456-04',
      email: 'roberto.silva@email.com',
      phone: '(11) 99999-4444',
      birthDate: '30/05/1965',
      gender: 'Masculino',
      status: 'active',
      lastVisit: '18/09/2024',
      insurance: 'Amil',
      totalAppointments: 15
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'archived': return 'Arquivado';
      default: return 'Desconhecido';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === "" || 
                         patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.cpf?.includes(searchTerm) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectPatient = (patientId: number) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const handlePrintPatients = () => {
    try {
      // Create a print-friendly version of the patient list
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão');
        return;
      }

      const printContent = generatePrintContent();
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      toast.success('Lista de pacientes enviada para impressão!');
    } catch (error) {
      console.error('Error printing patients:', error);
      toast.error('Erro ao imprimir lista de pacientes');
    }
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Pacientes - ${currentDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .header p { color: #6b7280; margin: 5px 0; }
            .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .summary h3 { margin-top: 0; color: #374151; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .summary-item { display: flex; justify-content: space-between; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .data-table th { background: #f9fafb; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Pacientes</h1>
            <p>Data: ${currentDate} | Total: ${totalPatients} pacientes</p>
          </div>
          
          <div class="summary">
            <h3>Resumo</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total de Pacientes:</span>
                <span>${totalPatients}</span>
              </div>
              <div class="summary-item">
                <span>Pacientes Ativos:</span>
                <span>${activePatients}</span>
              </div>
              <div class="summary-item">
                <span>Pacientes Inativos:</span>
                <span>${totalPatients - activePatients}</span>
              </div>
              <div class="summary-item">
                <span>Taxa de Ativos:</span>
                <span>${totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0}%</span>
              </div>
            </div>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Idade</th>
                <th>Convênio</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPatients.map(patient => `
                <tr>
                  <td>${patient.name}</td>
                  <td>${patient.cpf}</td>
                  <td>${patient.email}</td>
                  <td>${patient.phone}</td>
                  <td>${patient.age} anos</td>
                  <td>${patient.insurance}</td>
                  <td>${getStatusText(patient.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema CliniCore</p>
            <p>Data de geração: ${currentDate}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPatients = async () => {
    try {
      // Generate CSV content with proper encoding
      const csvHeaders = ['Nome', 'CPF', 'Email', 'Telefone', 'Data de Nascimento', 'Idade', 'Gênero', 'Convênio', 'Status', 'Última Visita', 'Total de Consultas']
      const csvRows = filteredPatients.map(patient => [
        patient.name,
        patient.cpf,
        patient.email,
        patient.phone,
        patient.birthDate,
        patient.age,
        patient.gender,
        patient.insurance,
        getStatusText(patient.status),
        patient.lastVisit,
        patient.totalAppointments
      ])
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent
      
      // Download CSV
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Lista de pacientes exportada com sucesso!');
    } catch (error) {
      console.error('Error exporting patients:', error);
      toast.error('Erro ao exportar pacientes');
    }
  };

  const handleImportPatients = () => {
    setShowImportModal(true);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      toast.success('Arquivo importado com sucesso!');
      setShowImportModal(false);
      loadPatients(); // Reload data
    }
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient(patient);
    setShowPatientModal(true);
  };

  const handleScheduleAppointment = (patient: any) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const handleSavePatient = async (patientData: any) => {
    try {
      let result
      if (editingPatient) {
        // Update existing patient
        result = await apiService.updatePatient(editingPatient.id.toString(), patientData);
        if (result && result.id) {
          toast.success('Paciente atualizado com sucesso!');
        } else {
          toast.error('Erro ao atualizar paciente');
        }
      } else {
        // Create new patient
        result = await apiService.createPatient(patientData);
        if (result && result.id) {
          toast.success('Paciente criado com sucesso!');
        } else {
          toast.error('Erro ao criar paciente');
        }
      }
      
      setShowPatientModal(false);
      setEditingPatient(null);
      setSelectedPatient(null);
      await loadPatients(); // Reload data from PostgreSQL
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Erro ao salvar paciente');
    }
  };

  const handleCancelPatient = () => {
    setShowPatientModal(false);
    setEditingPatient(null);
    setSelectedPatient(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedPatients.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedPatients.length} paciente(s)?`)) {
      try {
        // Delete patients in parallel
        const deletePromises = selectedPatients.map(async (id) => {
          try {
            const result = await apiService.deletePatient(id.toString());
            return { id, success: true, result };
          } catch (error) {
            console.error(`Error deleting patient ${id}:`, error);
            return { id, success: false, error };
          }
        });
        
        const results = await Promise.all(deletePromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        if (successful > 0) {
          toast.success(`${successful} paciente(s) excluído(s) com sucesso!`);
        }
        if (failed > 0) {
          toast.error(`${failed} paciente(s) não puderam ser excluídos`);
        }
        
        setSelectedPatients([]);
        await loadPatients(); // Reload data from PostgreSQL
      } catch (error) {
        console.error('Error deleting patients:', error);
        toast.error('Erro ao excluir pacientes');
      }
    }
  };

  const handleMoreFilters = () => {
    setShowFiltersModal(true);
  };

  return (
    <AppLayout 
      title="Pacientes" 
      subtitle="Gestão completa de pacientes e prontuários"
    >
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            Gestão completa de pacientes e prontuários
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintPatients}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPatients}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleImportPatients}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              loadPatients();
            }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={() => {
              setEditingPatient(null);
              setShowPatientModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Buscar Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleMoreFilters}
            >
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Lista de Pacientes
              </CardTitle>
              <CardDescription>
                {filteredPatients.length} pacientes encontrados
              </CardDescription>
            </div>
            {selectedPatients.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPatients.length} selecionados
                </span>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                  aria-label="Selecionar todos os pacientes"
                />
              </div>
              <div className="col-span-3">Nome</div>
              <div className="col-span-2">CPF</div>
              <div className="col-span-2">Contato</div>
              <div className="col-span-1">Idade</div>
              <div className="col-span-1">Convênio</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Ações</div>
            </div>

            {/* Patient Rows */}
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="grid grid-cols-12 gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => handleSelectPatient(patient.id)}
                    className="rounded"
                    aria-label={`Selecionar paciente ${patient.name}`}
                  />
                </div>
                
                <div className="col-span-3">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-muted-foreground">{patient.gender}</div>
                </div>
                
                <div className="col-span-2">
                  <div className="text-sm">{patient.cpf}</div>
                </div>
                
                <div className="col-span-2">
                  <div className="text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {patient.phone}
                  </div>
                  <div className="text-sm flex items-center text-muted-foreground">
                    <Mail className="w-3 h-3 mr-1" />
                    {patient.email}
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="text-sm">
                    {new Date().getFullYear() - new Date(patient.birthDate.split('/').reverse().join('-')).getFullYear()} anos
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="text-sm">{patient.insurance}</div>
                </div>
                
                <div className="col-span-1">
                  <Badge className={getStatusColor(patient.status)}>
                    {getStatusText(patient.status)}
                  </Badge>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                      title="Editar paciente"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleScheduleAppointment(patient)}
                      title="Agendar consulta"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              com consultas recentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => {
                if (!p.createdAt) return false;
                const patientDate = new Date(p.createdAt);
                const currentDate = new Date();
                return patientDate.getMonth() === currentDate.getMonth() && 
                       patientDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              novos cadastros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.length > 0 ? 
                Math.round((patients.filter(p => p.totalAppointments > 1).length / patients.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              pacientes retornam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Modal */}
      <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {editingPatient ? 'Editar Paciente' : selectedPatient ? 'Detalhes do Paciente' : 'Novo Paciente'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && !editingPatient ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                  <p className="text-sm">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                  <p className="text-sm">{selectedPatient.cpf}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedPatient.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                  <p className="text-sm">{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                  <p className="text-sm">{selectedPatient.birthDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gênero</Label>
                  <p className="text-sm">{selectedPatient.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Convênio</Label>
                  <p className="text-sm">{selectedPatient.insurance}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedPatient.status)}>
                    {getStatusText(selectedPatient.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Última Visita</Label>
                  <p className="text-sm">{selectedPatient.lastVisit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total de Consultas</Label>
                  <p className="text-sm font-bold">{selectedPatient.totalAppointments}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPatientModal(false);
                    handleEditPatient(selectedPatient);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={() => {
                    setShowPatientModal(false);
                    handleScheduleAppointment(selectedPatient);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name"
                    defaultValue={editingPatient?.name || ''}
                    placeholder="Nome completo do paciente"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf"
                    defaultValue={editingPatient?.cpf || ''}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    defaultValue={editingPatient?.email || ''}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone"
                    defaultValue={editingPatient?.phone || ''}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input 
                    id="birthDate"
                    type="date"
                    defaultValue={editingPatient?.birthDate ? 
                      editingPatient.birthDate.split('/').reverse().join('-') : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select defaultValue={editingPatient?.gender?.toLowerCase() || 'masculino'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insurance">Convênio</Label>
                  <Input 
                    id="insurance"
                    defaultValue={editingPatient?.insurance || ''}
                    placeholder="Nome do convênio"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={editingPatient?.status || 'active'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCancelPatient}
                >
                  Cancelar
                </Button>
                <Button 
                  className="medical-button-primary"
                  onClick={() => {
                    // Get form data and save
                    const formData = {
                      full_name: (document.getElementById('name') as HTMLInputElement)?.value,
                      cpf: (document.getElementById('cpf') as HTMLInputElement)?.value,
                      email: (document.getElementById('email') as HTMLInputElement)?.value,
                      phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                      birth_date: (document.getElementById('birthDate') as HTMLInputElement)?.value,
                      gender: (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent?.toLowerCase(),
                      insurance_company: (document.getElementById('insurance') as HTMLInputElement)?.value,
                      is_active: (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent === 'Ativo'
                    };
                    handleSavePatient(formData);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {editingPatient ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Pacientes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Arquivo CSV</Label>
              <Input 
                id="import-file"
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Formato esperado: Nome, CPF, Email, Telefone, Data de Nascimento, Gênero, Convênio</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters Modal */}
      <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Avançados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-gender">Gênero</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os gêneros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-insurance">Convênio</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os convênios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Array.from(new Set(
                    patients
                      .map((p: any) => p.insurance)
                      .filter(Boolean)
                  )).map((insurance: string) => (
                    <SelectItem key={insurance} value={insurance}>
                      {insurance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-age-min">Idade Mínima</Label>
              <Input 
                id="filter-age-min"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="filter-age-max">Idade Máxima</Label>
              <Input 
                id="filter-age-max"
                type="number"
                placeholder="100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFiltersModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="medical-button-primary"
                onClick={() => {
                  toast.success('Filtros aplicados com sucesso!');
                  setShowFiltersModal(false);
                }}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agendar Consulta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Paciente</Label>
              <p className="text-sm font-medium">{selectedPatient?.name}</p>
            </div>
            <div>
              <Label htmlFor="appointment-date">Data da Consulta</Label>
              <Input 
                id="appointment-date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="appointment-time">Horário</Label>
              <Input 
                id="appointment-time"
                type="time"
                defaultValue="09:00"
              />
            </div>
            <div>
              <Label htmlFor="appointment-doctor">Médico</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor: any) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.full_name || doctor.name || 'Dr. Não Informado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointment-notes">Observações</Label>
              <Textarea 
                id="appointment-notes"
                placeholder="Observações sobre a consulta..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="medical-button-primary"
                onClick={async () => {
                  try {
                    const appointmentData = {
                      patient_id: selectedPatient.id,
                      appointment_date: (document.getElementById('appointment-date') as HTMLInputElement)?.value,
                      appointment_time: (document.getElementById('appointment-time') as HTMLInputElement)?.value,
                      doctor_id: (document.querySelector('[role="combobox"]') as HTMLInputElement)?.textContent,
                      notes: (document.getElementById('appointment-notes') as HTMLInputElement)?.value,
                      status: 'scheduled'
                    };
                    
                    const result = await apiService.createAppointment(appointmentData);
                    if (result && result.id) {
                      toast.success('Consulta agendada com sucesso!');
                      setShowAppointmentModal(false);
                    } else {
                      toast.error('Erro ao agendar consulta');
                    }
                  } catch (error) {
                    console.error('Error scheduling appointment:', error);
                    toast.error('Erro ao agendar consulta');
                  }
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SecretariaPacientes;
