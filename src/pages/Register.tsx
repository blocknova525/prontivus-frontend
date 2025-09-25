import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, EyeOff, Shield, Mail, User, Phone, Calendar, CreditCard } from 'lucide-react';
import { MaskedInput } from '@/components/ui/MaskedInput';
import BrandedFooter from '@/components/ui/BrandedFooter';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { BRANDING } from '@/config/branding';

// Staff registration schema
const staffRegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  full_name: z.string().min(2, "Nome completo é obrigatório"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/\d/, "Senha deve conter pelo menos um número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Senha deve conter pelo menos um caractere especial"),
  confirm_password: z.string(),
  role: z.enum(["doctor", "secretary", "finance", "admin"]),
  crm: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Senhas não coincidem",
  path: ["confirm_password"],
}).refine((data) => {
  if (data.role === "doctor" && !data.crm) {
    return false;
  }
  return true;
}, {
  message: "CRM é obrigatório para médicos",
  path: ["crm"],
});

// Patient registration schema
const patientRegisterSchema = z.object({
  full_name: z.string().min(2, "Nome completo é obrigatório"),
  cpf: z.string()
    .min(11, "CPF deve ter 11 dígitos")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/\d/, "Senha deve conter pelo menos um número"),
  confirm_password: z.string(),
  insurance_company: z.string().optional(),
  insurance_number: z.string().optional(),
  insurance_plan: z.string().optional(),
  consent_given: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Senhas não coincidem",
  path: ["confirm_password"],
});

type StaffRegisterData = z.infer<typeof staffRegisterSchema>;
type PatientRegisterData = z.infer<typeof patientRegisterSchema>;

interface RegisterProps {
  type?: "staff" | "patient";
}

const Register = ({ type = "staff" }: RegisterProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isStaff = type === "staff";

  const staffForm = useForm<StaffRegisterData>({
    resolver: zodResolver(staffRegisterSchema),
  });

  const patientForm = useForm<PatientRegisterData>({
    resolver: zodResolver(patientRegisterSchema),
  });

  const form = isStaff ? staffForm : patientForm;

  const onSubmit = async (data: any) => {
    console.log('Registration form submitted with data:', data);
    setIsLoading(true);
    setError(null);

    try {
      // Remove confirm_password field before sending to backend
      const { confirm_password, ...dataToSend } = data;
      console.log('Data to send to backend:', dataToSend);
      
      let result;
      if (isStaff) {
        console.log('Calling apiService.registerStaff...');
        result = await apiService.registerStaff(dataToSend);
      } else {
        console.log('Calling apiService.registerPatient...');
        result = await apiService.registerPatient(dataToSend);
      }
      console.log('Registration result:', result);

      if (isStaff) {
        navigate('/');
      } else {
        navigate('/login?message=Conta criada com sucesso! Faça login para continuar.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(extractErrorMessage(err, "Erro ao criar conta. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <img 
              src={BRANDING.assets.logoTransparent} 
              alt={BRANDING.name}
              className="h-32 w-auto"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center hidden">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Common fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <div className="relative">
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Seu nome completo"
                    {...form.register("full_name")}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {form.formState.errors.full_name && (
                  <p className="text-sm text-red-600">{form.formState.errors.full_name.message || 'Nome completo é obrigatório'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...form.register("email")}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message || 'Email inválido'}</p>
                )}
              </div>
            </div>

            {/* Staff-specific fields */}
            {isStaff && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="seu_username"
                      {...form.register("username")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-600">{form.formState.errors.username.message || 'Nome de usuário é obrigatório'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select onValueChange={(value) => form.setValue("role", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="secretary">Secretário(a)</SelectItem>
                        <SelectItem value="finance">Financeiro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600">{form.formState.errors.role.message || 'Função é obrigatória'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM (apenas para médicos)</Label>
                    <Input
                      id="crm"
                      type="text"
                      placeholder="00000"
                      {...form.register("crm")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.crm && (
                      <p className="text-sm text-red-600">{form.formState.errors.crm.message || 'CRM é obrigatório'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Ex: Cardiologia"
                      {...form.register("specialty")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.specialty && (
                      <p className="text-sm text-red-600">{form.formState.errors.specialty.message || 'Especialidade é obrigatória'}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Patient-specific fields */}
            {!isStaff && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <MaskedInput
                      id="cpf"
                      label="CPF"
                      mask="cpf"
                      required={true}
                      placeholder="000.000.000-00"
                      {...form.register("cpf")}
                      disabled={isLoading}
                      error={form.formState.errors.cpf?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <div className="relative">
                      <Input
                        id="birth_date"
                        type="date"
                        {...form.register("birth_date")}
                        disabled={isLoading}
                        className="pl-10"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {form.formState.errors.birth_date && (
                      <p className="text-sm text-red-600">{form.formState.errors.birth_date.message || 'Data de nascimento é obrigatória'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <MaskedInput
                    id="phone"
                    label="Telefone"
                    mask="phone"
                    required={true}
                    placeholder="(00) 00000-0000"
                    {...form.register("phone")}
                    disabled={isLoading}
                    error={form.formState.errors.phone?.message}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações do Convênio (Opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_company">Convênio</Label>
                      <Input
                        id="insurance_company"
                        type="text"
                        placeholder="Nome do convênio"
                        {...form.register("insurance_company")}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance_number">Número do Convênio</Label>
                      <Input
                        id="insurance_number"
                        type="text"
                        placeholder="Número"
                        {...form.register("insurance_number")}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance_plan">Plano</Label>
                      <Input
                        id="insurance_plan"
                        type="text"
                        placeholder="Tipo do plano"
                        {...form.register("insurance_plan")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Phone field for staff */}
            {isStaff && (
              <div className="space-y-2">
                <MaskedInput
                  id="phone"
                  label="Telefone"
                  mask="phone"
                  required={true}
                  placeholder="(00) 00000-0000"
                  {...form.register("phone")}
                  disabled={isLoading}
                  error={form.formState.errors.phone?.message}
                />
              </div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    {...form.register("password")}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message || 'Senha inválida'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    {...form.register("confirm_password")}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirm_password && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirm_password.message || 'Confirmação de senha inválida'}</p>
                )}
              </div>
            </div>

            {/* Consent checkbox for patients */}
            {!isStaff && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent_given"
                  {...form.register("consent_given", { setValueAs: (value) => !!value })}
                  disabled={isLoading}
                />
                <Label htmlFor="consent_given" className="text-sm leading-relaxed">
                  Eu aceito os{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                    política de privacidade
                  </Link>{" "}
                  do CliniCore, incluindo o processamento dos meus dados pessoais conforme a LGPD.
                </Label>
              </div>
            )}

            {form.formState.errors.consent_given && (
              <p className="text-sm text-red-600">{form.formState.errors.consent_given.message || 'Você deve aceitar os termos de uso'}</p>
            )}

            <Button type="submit" className="w-full medical-button-primary" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isStaff ? "Criar Conta de Funcionário" : "Criar Conta de Paciente"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-800">
                  Faça login
                </Link>
              </p>
              {isStaff ? (
                <p className="text-sm text-gray-600">
                  É um paciente?{" "}
                  <Link to="/auth/register/patient" className="text-blue-600 hover:text-blue-800">
                    Cadastre-se como Paciente
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  É um funcionário?{" "}
                  <Link to="/auth/register" className="text-blue-600 hover:text-blue-800">
                    Cadastre-se como Funcionário
                  </Link>
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <BrandedFooter 
          showCopyright={true}
          additionalInfo="Sistema de gestão médica inteligente"
        />
      </Card>
    </div>
  );
};

export default Register;
