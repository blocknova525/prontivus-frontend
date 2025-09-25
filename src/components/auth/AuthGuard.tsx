import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }

      try {
        // Test the token by making a health check request
        await apiService.healthCheck();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null if not authenticated (will redirect to login)
  return null;
};

export default AuthGuard;
