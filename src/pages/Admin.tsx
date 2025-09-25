import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Filter,
  AlertTriangle,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface Patient {
  id: number;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant_id: number;
}

const Admin = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [creatingPatient, setCreatingPatient] = useState<Partial<Patient>>({});
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  
  // Auto-refresh states
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        if (!isRefreshing && !isViewModalOpen && !isEditModalOpen && !isCreateModalOpen && !isDeleteModalOpen) {
          loadPatients(true); // Silent refresh
        }
      }, 500); // 0.5 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefreshEnabled, isRefreshing, isViewModalOpen, isEditModalOpen, isCreateModalOpen, isDeleteModalOpen]);

  const loadPatients = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      setIsRefreshing(true);
      
      const patientsData = await apiService.getPatients();
      setPatients(patientsData || []);
      setLastUpdateTime(new Date());
      
    } catch (err: any) {
      console.error('Error loading patients:', err);
      if (!silent) {
        setError('Erro ao carregar pacientes');
        setPatients([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.cpf.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && patient.is_active) ||
                         (statusFilter === 'inactive' && !patient.is_active);
    
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Patient operation handlers
  const handleViewPatient = async (patientId: number) => {
    try {
      const patientData = await apiService.getPatient(patientId.toString());
      setSelectedPatient(patientData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error loading patient:', error);
      toast.error('Erro ao carregar dados do paciente');
    }
  };

  const handleEditPatient = async (patientId: number) => {
    try {
      const patientData = await apiService.getPatient(patientId.toString());
      setEditingPatient(patientData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error loading patient:', error);
      toast.error('Erro ao carregar dados do paciente');
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setDeletingPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatient) return;
    
    try {
      await apiService.deletePatient(deletingPatient.id.toString());
      toast.success('Paciente excluído com sucesso');
      setIsDeleteModalOpen(false);
      setDeletingPatient(null);
      loadPatients(); // Reload the list
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Erro ao excluir paciente');
    }
  };

  const handleSavePatient = async () => {
    if (!editingPatient) return;
    
    try {
      await apiService.updatePatient(editingPatient.id.toString(), editingPatient);
      toast.success('Paciente atualizado com sucesso');
      setIsEditModalOpen(false);
      setEditingPatient(null);
      loadPatients(); // Reload the list
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente');
    }
  };

  const handleCreatePatient = () => {
    setCreatingPatient({
      full_name: '',
      cpf: '',
      email: '',
      phone: '',
      birth_date: '',
      gender: '',
      is_active: true
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveNewPatient = async () => {
    if (!creatingPatient.full_name || !creatingPatient.cpf || !creatingPatient.birth_date || !creatingPatient.gender) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      await apiService.createPatient(creatingPatient);
      toast.success('Paciente criado com sucesso');
      setIsCreateModalOpen(false);
      setCreatingPatient({});
      loadPatients(); // Reload the list
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao criar paciente');
    }
  };

  // Refresh control functions
  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled(!isAutoRefreshEnabled);
  };

  const manualRefresh = () => {
    loadPatients();
  };

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pacientes...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
            <p className="text-gray-600 mt-1">Gerenciar pacientes e configurações do sistema</p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleCreatePatient}>
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  <p className="text-xs text-gray-500">Registrados no sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.is_active).length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {patients.length > 0 ? Math.round((patients.filter(p => p.is_active).length / patients.length) * 100) : 0}% do total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pacientes Inativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => !p.is_active).length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {patients.length > 0 ? Math.round((patients.filter(p => !p.is_active).length / patients.length) * 100) : 0}% do total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cadastrados Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => {
                      const today = new Date().toDateString();
                      const createdDate = new Date(p.created_at).toDateString();
                      return today === createdDate;
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500">Novos registros hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cadastrados Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const createdDate = new Date(p.created_at);
                      return createdDate >= weekAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500">Últimos 7 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Por Gênero</p>
                  <p className="text-lg font-bold text-gray-900">
                    M: {patients.filter(p => p.gender === 'male').length} | 
                    F: {patients.filter(p => p.gender === 'female').length}
                  </p>
                  <p className="text-xs text-gray-500">Distribuição por gênero</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sem E-mail</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => !p.email || p.email.trim() === '').length}
                  </p>
                  <p className="text-xs text-gray-500">Pacientes sem contato</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Lista de Pacientes ({filteredPatients.length})
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAutoRefreshEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm text-gray-500">
                      Última atualização: {formatLastUpdate(lastUpdateTime)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={manualRefresh}
                    disabled={isRefreshing}
                    title="Atualizar manualmente"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant={isAutoRefreshEnabled ? "default" : "outline"}
                    onClick={toggleAutoRefresh}
                    title={isAutoRefreshEnabled ? "Pausar atualização automática" : "Ativar atualização automática"}
                  >
                    {isAutoRefreshEnabled ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                    aria-label="Selecionar todos os pacientes"
                  />
                  <span className="text-sm text-gray-600">Selecionar todos</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadPatients}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum paciente encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Selecionar</th>
                      <th className="text-left p-3">Nome</th>
                      <th className="text-left p-3">CPF</th>
                      <th className="text-left p-3">Contato</th>
                      <th className="text-left p-3">Idade</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Cadastro</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => handleSelectPatient(patient.id)}
                            className="rounded"
                            aria-label={`Selecionar paciente ${patient.full_name}`}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{patient.full_name}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {patient.gender === 'male' ? 'Masculino' : 
                             patient.gender === 'female' ? 'Feminino' : 'Outro'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-mono">{formatCPF(patient.cpf)}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm flex items-center gap-1 mb-1">
                            <Phone className="w-3 h-3" />
                            {formatPhone(patient.phone)}
                          </div>
                          <div className="text-sm flex items-center gap-1 text-gray-500">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{calculateAge(patient.birth_date)}</div>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={patient.is_active ? 'default' : 'secondary'}
                            className={patient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {patient.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{formatDate(patient.created_at)}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewPatient(patient.id)}
                              title="Visualizar paciente"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditPatient(patient.id)}
                              title="Editar paciente"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeletePatient(patient)}
                              title="Excluir paciente"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Patient Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Paciente</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome Completo</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">CPF</Label>
                    <p className="text-sm text-gray-600">{formatCPF(selectedPatient.cpf)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Telefone</Label>
                    <p className="text-sm text-gray-600">{formatPhone(selectedPatient.phone)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data de Nascimento</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedPatient.birth_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gênero</Label>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedPatient.gender === 'male' ? 'Masculino' : 
                       selectedPatient.gender === 'female' ? 'Feminino' : 'Outro'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge 
                      variant={selectedPatient.is_active ? 'default' : 'secondary'}
                      className={selectedPatient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {selectedPatient.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data de Cadastro</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedPatient.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Patient Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            {editingPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={editingPatient.full_name}
                      onChange={(e) => setEditingPatient({...editingPatient, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={editingPatient.cpf}
                      onChange={(e) => setEditingPatient({...editingPatient, cpf: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingPatient.email}
                      onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editingPatient.phone}
                      onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={editingPatient.birth_date}
                      onChange={(e) => setEditingPatient({...editingPatient, birth_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <select
                      id="gender"
                      value={editingPatient.gender}
                      onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Selecionar gênero"
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePatient}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
            </DialogHeader>
            {deletingPatient && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Tem certeza que deseja excluir o paciente <strong>{deletingPatient.full_name}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={confirmDeletePatient}>
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Patient Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
            </DialogHeader>
            {creatingPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-full_name">Nome Completo *</Label>
                    <Input
                      id="create-full_name"
                      value={creatingPatient.full_name || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, full_name: e.target.value})}
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-cpf">CPF *</Label>
                    <Input
                      id="create-cpf"
                      value={creatingPatient.cpf || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-email">E-mail</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={creatingPatient.email || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-phone">Telefone</Label>
                    <Input
                      id="create-phone"
                      value={creatingPatient.phone || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-birth_date">Data de Nascimento *</Label>
                    <Input
                      id="create-birth_date"
                      type="date"
                      value={creatingPatient.birth_date || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, birth_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-gender">Gênero *</Label>
                    <select
                      id="create-gender"
                      value={creatingPatient.gender || ''}
                      onChange={(e) => setCreatingPatient({...creatingPatient, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Selecionar gênero"
                    >
                      <option value="">Selecione o gênero</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveNewPatient}>
                    Criar Paciente
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Admin;
