import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  UserPlus, 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  FileText,
  Shield,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface PatientFormData {
  // Personal Information
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  phone_secondary?: string;
  
  // Address
  address: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical Information
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  medications?: string;
  
  // Insurance Information
  insurance_company?: string;
  insurance_number?: string;
  insurance_plan?: string;
  
  // Visual Information
  height_cm?: number;
  weight_kg?: number;
  eye_color?: string;
  hair_color?: string;
  skin_tone?: string;
  distinguishing_features?: string;
  mobility_aids?: string;
  visual_notes?: string;
  
  // LGPD Compliance
  consent_given: boolean;
  consent_date: string;
  data_sharing_consent: boolean;
}

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: '',
    cpf: '',
    birth_date: '',
    gender: 'male',
    email: '',
    phone: '',
    phone_secondary: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    blood_type: '',
    allergies: '',
    chronic_conditions: '',
    medications: '',
    insurance_company: '',
    insurance_number: '',
    insurance_plan: '',
    height_cm: undefined,
    weight_kg: undefined,
    eye_color: '',
    hair_color: '',
    skin_tone: '',
    distinguishing_features: '',
    mobility_aids: '',
    visual_notes: '',
    consent_given: false,
    consent_date: new Date().toISOString().split('T')[0],
    data_sharing_consent: false
  });

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.full_name || !formData.cpf || !formData.email || !formData.phone) {
        setError('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!formData.consent_given) {
        setError('É necessário aceitar os termos de uso para continuar');
        return;
      }

      // Prepare patient data for API
      const patientData = {
        ...formData,
        birth_date: formData.birth_date ? new Date(formData.birth_date).toISOString() : null,
        height_cm: formData.height_cm || null,
        weight_kg: formData.weight_kg || null,
        // Remove empty strings and convert to null
        phone_secondary: formData.phone_secondary || null,
        address_complement: formData.address_complement || null,
        blood_type: formData.blood_type || null,
        allergies: formData.allergies || null,
        chronic_conditions: formData.chronic_conditions || null,
        medications: formData.medications || null,
        insurance_company: formData.insurance_company || null,
        insurance_number: formData.insurance_number || null,
        insurance_plan: formData.insurance_plan || null,
        eye_color: formData.eye_color || null,
        hair_color: formData.hair_color || null,
        skin_tone: formData.skin_tone || null,
        distinguishing_features: formData.distinguishing_features || null,
        mobility_aids: formData.mobility_aids || null,
        visual_notes: formData.visual_notes || null,
      };

      // Call API to create patient
      const result = await apiService.createPatient(patientData);
      
      // Show success message and navigate
      alert('Paciente cadastrado com sucesso!');
      navigate('/secretaria/pacientes');
      
    } catch (err: any) {
      console.error('Error creating patient:', err);
      setError(extractErrorMessage(err, 'Erro ao cadastrar paciente. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Informações Pessoais</h2>
              <p className="text-gray-600">Dados básicos do paciente</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birth_date ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.birth_date ? new Date(formData.birth_date) : undefined}
                      onSelect={(date) => handleInputChange('birth_date', date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Sexo *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Principal *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_secondary">Telefone Secundário</Label>
                <Input
                  id="phone_secondary"
                  value={formData.phone_secondary}
                  onChange={(e) => handleInputChange('phone_secondary', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Endereço</h2>
              <p className="text-gray-600">Informações de localização</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address_number">Número *</Label>
                <Input
                  id="address_number"
                  value={formData.address_number}
                  onChange={(e) => handleInputChange('address_number', e.target.value)}
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input
                  id="address_complement"
                  value={formData.address_complement}
                  onChange={(e) => handleInputChange('address_complement', e.target.value)}
                  placeholder="Apto, Casa, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP *</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', formatZipCode(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Contato de Emergência</h2>
              <p className="text-gray-600">Pessoa para contato em caso de emergência</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nome do Contato *</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone *</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergency_contact_relationship">Parentesco *</Label>
                <Select value={formData.emergency_contact_relationship} onValueChange={(value) => handleInputChange('emergency_contact_relationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pai">Pai</SelectItem>
                    <SelectItem value="mae">Mãe</SelectItem>
                    <SelectItem value="conjuge">Cônjuge</SelectItem>
                    <SelectItem value="filho">Filho(a)</SelectItem>
                    <SelectItem value="irmao">Irmão(ã)</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Informações Médicas</h2>
              <p className="text-gray-600">Dados médicos e informações visuais</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
                <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo sanguíneo" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height_cm">Altura (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm || ''}
                  onChange={(e) => handleInputChange('height_cm', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="170"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={formData.weight_kg || ''}
                  onChange={(e) => handleInputChange('weight_kg', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="70"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eye_color">Cor dos Olhos</Label>
                <Input
                  id="eye_color"
                  value={formData.eye_color}
                  onChange={(e) => handleInputChange('eye_color', e.target.value)}
                  placeholder="Castanho, Azul, Verde..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hair_color">Cor do Cabelo</Label>
                <Input
                  id="hair_color"
                  value={formData.hair_color}
                  onChange={(e) => handleInputChange('hair_color', e.target.value)}
                  placeholder="Preto, Castanho, Loiro..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skin_tone">Tom de Pele</Label>
                <Input
                  id="skin_tone"
                  value={formData.skin_tone}
                  onChange={(e) => handleInputChange('skin_tone', e.target.value)}
                  placeholder="Claro, Médio, Escuro..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Liste as alergias conhecidas..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="chronic_conditions">Condições Crônicas</Label>
                <Textarea
                  id="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                  placeholder="Diabetes, Hipertensão, etc..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  placeholder="Liste os medicamentos que toma regularmente..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distinguishing_features">Características Distintivas</Label>
                <Textarea
                  id="distinguishing_features"
                  value={formData.distinguishing_features}
                  onChange={(e) => handleInputChange('distinguishing_features', e.target.value)}
                  placeholder="Cicatrizes, tatuagens, marcas de nascença..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="visual_notes">Observações Visuais</Label>
                <Textarea
                  id="visual_notes"
                  value={formData.visual_notes}
                  onChange={(e) => handleInputChange('visual_notes', e.target.value)}
                  placeholder="Uso de óculos, aparelho auditivo, etc..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Convênio e Termos</h2>
              <p className="text-gray-600">Informações do convênio e aceite dos termos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="insurance_company">Convênio</Label>
                <Input
                  id="insurance_company"
                  value={formData.insurance_company}
                  onChange={(e) => handleInputChange('insurance_company', e.target.value)}
                  placeholder="Nome do convênio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance_number">Número do Convênio</Label>
                <Input
                  id="insurance_number"
                  value={formData.insurance_number}
                  onChange={(e) => handleInputChange('insurance_number', e.target.value)}
                  placeholder="Número da carteirinha"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="insurance_plan">Plano</Label>
                <Input
                  id="insurance_plan"
                  value={formData.insurance_plan}
                  onChange={(e) => handleInputChange('insurance_plan', e.target.value)}
                  placeholder="Nome do plano"
                />
              </div>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Termos de Uso e LGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent_given"
                    checked={formData.consent_given}
                    onCheckedChange={(checked) => handleInputChange('consent_given', checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_given" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Aceito os termos de uso e política de privacidade *
                    </Label>
                    <p className="text-xs text-gray-500">
                      Concordo com o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="data_sharing_consent"
                    checked={formData.data_sharing_consent}
                    onCheckedChange={(checked) => handleInputChange('data_sharing_consent', checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="data_sharing_consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Autorizo o compartilhamento de dados com profissionais da saúde
                    </Label>
                    <p className="text-xs text-gray-500">
                      Permito que meus dados sejam compartilhados com médicos e outros profissionais da saúde para melhor atendimento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/secretaria/pacientes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cadastro de Paciente</h1>
            <p className="text-gray-600">Registre um novo paciente no sistema</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Pessoal</span>
              <span>Endereço</span>
              <span>Emergência</span>
              <span>Médico</span>
              <span>Convênio</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-600">
                <Shield className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Paciente
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PatientRegistration;
