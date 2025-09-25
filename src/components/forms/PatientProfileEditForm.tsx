import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save, X, User, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';
import { apiService } from '@/lib/api';

interface PatientProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: string;
  address: string;
  insurance_company: string;
  insurance_number: string;
  avatar_url?: string;
}

interface PatientProfileEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientProfile: PatientProfile | null;
  onSuccess: () => void;
}

const PatientProfileEditForm: React.FC<PatientProfileEditFormProps> = ({
  isOpen,
  onClose,
  patientProfile,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '',
    address: '',
    insurance_company: '',
    insurance_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientProfile && isOpen) {
      setFormData({
        full_name: patientProfile.full_name || '',
        email: patientProfile.email || '',
        phone: patientProfile.phone || '',
        cpf: patientProfile.cpf || '',
        birth_date: patientProfile.birth_date || '',
        gender: patientProfile.gender || '',
        address: patientProfile.address || '',
        insurance_company: patientProfile.insurance_company || '',
        insurance_number: patientProfile.insurance_number || ''
      });
    }
  }, [patientProfile, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating patient profile with data:', formData);
      
      // Update patient profile via API
      await apiService.updatePatientProfile(formData);
      
      console.log('Patient profile updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating patient profile:', err);
      setError(err.message || 'Erro ao atualizar perfil do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50/30">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200/60">
                <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-semibold text-slate-700">CPF</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-sm font-semibold text-slate-700">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gênero</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/60">
                <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200/60">
              <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informações do Convênio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="insurance_company" className="text-sm font-semibold text-slate-700">Convênio</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="insurance_company"
                      value={formData.insurance_company}
                      onChange={(e) => handleInputChange('insurance_company', e.target.value)}
                      placeholder="Nome do convênio"
                      className="pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_number" className="text-sm font-semibold text-slate-700">Número do Convênio</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="insurance_number"
                      value={formData.insurance_number}
                      onChange={(e) => handleInputChange('insurance_number', e.target.value)}
                      placeholder="Número do convênio"
                      className="pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-slate-200/60">
            <div className="flex gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={isLoading}
                className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileEditForm;
