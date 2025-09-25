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
import { Loader2, Eye, EyeOff, Shield, Mail } from 'lucide-react';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { BRANDING } from '@/config/branding';

const loginSchema = z.object({
  email_or_cpf: z.string().min(1, "Email ou CPF é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Function to determine redirect path based on user type and role
const getRedirectPath = (userType: string, userRole: string): string => {
  console.log(`getRedirectPath called with userType: "${userType}", userRole: "${userRole}"`);
  
  if (userType === 'patient') {
    console.log('User is patient, redirecting to /patient/dashboard');
    return '/patient/dashboard';
  }
  
  // Staff users - redirect based on role
  console.log('User is staff, checking role...');
  switch (userRole) {
    case 'admin':
      console.log('Admin role detected, redirecting to /admin');
      return '/admin';
    case 'doctor':
      console.log('Doctor role detected, redirecting to /atendimento');
      return '/atendimento';
    case 'secretary':
      console.log('Secretary role detected, redirecting to /secretaria');
      return '/secretaria';
    case 'finance':
      console.log('Finance role detected, redirecting to /financeiro');
      return '/financeiro';
    default:
      console.log(`Unknown role "${userRole}", redirecting to /dashboard`);
      return '/dashboard'; // Fallback to general dashboard
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting unified login...');
      let result;
      
      // Try patient login first (most restrictive)
      try {
        console.log('Trying patient login...');
        result = await apiService.patientLogin(data.email_or_cpf, data.password);
        console.log('Patient login successful:', result);
      } catch (patientErr: any) {
        console.log('Patient login failed, trying staff login...');
        // If patient login fails, try staff login
        try {
          result = await apiService.login(data.email_or_cpf, data.password);
          console.log('Staff login successful:', result);
        } catch (staffErr: any) {
          // Both failed, throw the staff error (which is more generic)
          throw staffErr;
        }
      }

      // Store tokens
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);

      // Handle different scenarios
      if (result.requires_2fa) {
        // TODO: Handle 2FA
        console.log('2FA required');
        return;
      }

      if (result.must_reset_password) {
        // TODO: Handle password reset
        console.log('Password reset required');
        return;
      }

      // Success - redirect based on user type and role
      const redirectPath = getRedirectPath(result.user_type, result.user_role);
      console.log(`Login successful! User type: ${result.user_type}, Role: ${result.user_role}, Redirecting to: ${redirectPath}`);
      console.log('Stored user_type in localStorage:', localStorage.getItem('user_type'));
      console.log('Full result object:', result);
      console.log('About to navigate to:', redirectPath);
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Provide more specific error messages based on the error
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      
      if (err.response?.status === 403) {
        if (err.response?.data?.detail?.includes("patient portal")) {
          errorMessage = "Acesso negado. Pacientes devem usar o portal do paciente.";
        } else if (err.response?.data?.detail?.includes("main system")) {
          errorMessage = "Acesso negado. Funcionários devem usar o sistema principal.";
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Credenciais inválidas. Verifique seu email/CPF e senha.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email_or_cpf">Email ou CPF</Label>
              <div className="relative">
                <Input
                  id="email_or_cpf"
                  type="text"
                  placeholder="seu@email.com ou 000.000.000-00"
                  {...register("email_or_cpf")}
                  disabled={isLoading}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email_or_cpf && (
                <p className="text-sm text-red-600">{errors.email_or_cpf.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  {...register("password")}
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
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember_me"
                  {...register("remember_me", { setValueAs: (value) => !!value })}
                  disabled={isLoading}
                />
                <Label htmlFor="remember_me" className="text-sm">
                  Lembrar de mim
                </Label>
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/auth/register" className="text-blue-600 hover:text-blue-800">
                  Cadastre-se como Funcionário
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                É um paciente?{" "}
                <Link to="/auth/register/patient" className="text-blue-600 hover:text-blue-800">
                  Cadastre-se como Paciente
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
