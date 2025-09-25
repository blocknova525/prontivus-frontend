import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsLoading(false);
      setError('Token de verificação não encontrado');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      // Simulate API call - replace with actual verification endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setIsVerified(true);
      } else {
        setError('Token inválido ou expirado');
      }
    } catch (err: any) {
      setError('Erro ao verificar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      // Simulate API call - replace with actual resend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (err: any) {
      setError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verificando Email...</h2>
              <p className="text-gray-600">
                Aguarde enquanto verificamos seu email
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Verificado!</CardTitle>
            <CardDescription className="text-gray-600">
              Seu email foi verificado com sucesso. Agora você pode fazer login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-500">
              <p>Você pode agora acessar todas as funcionalidades da sua conta.</p>
            </div>
            <Link to="/login">
              <Button className="w-full">
                Ir para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Verificação Falhou</CardTitle>
          <CardDescription className="text-gray-600">
            {error || 'Não foi possível verificar seu email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>O link pode ter expirado ou ser inválido.</p>
            <p className="mt-2">Você pode solicitar um novo email de verificação.</p>
          </div>
          
          <div className="space-y-2">
            {email && (
              <Button 
                variant="outline" 
                onClick={resendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar Email
                  </>
                )}
              </Button>
            )}
            
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
