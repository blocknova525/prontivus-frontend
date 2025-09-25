import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  confirmLogout?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'ghost',
  size = 'sm',
  className,
  showIcon = true,
  showText = true,
  confirmLogout = true
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirmLogout) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Tem certeza que deseja sair do sistema?\n\nTodos os dados não salvos serão perdidos.'
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      // Clear all authentication data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
      localStorage.removeItem('tenant_id');
      
      // Clear any other app-specific data
      sessionStorage.clear();
      
      // Show success message
      toast.success('Logout realizado com sucesso!', {
        description: 'Você foi desconectado do sistema.',
        duration: 3000,
      });
      
      // Navigate to login page
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        duration: 5000,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={cn(
        'transition-all duration-200',
        variant === 'ghost' && 'text-red-600 hover:text-red-700 hover:bg-red-50',
        variant === 'destructive' && 'bg-red-600 hover:bg-red-700 text-white',
        className
      )}
      title="Sair do sistema"
    >
      {showIcon && (
        <LogOut className="w-4 h-4" />
      )}
      {showText && (
        <span className="font-medium">Sair</span>
      )}
    </Button>
  );
};

// Enhanced logout button with confirmation dialog
export const LogoutButtonWithConfirmation: React.FC<LogoutButtonProps> = (props) => {
  return <LogoutButton {...props} confirmLogout={true} />;
};

// Simple logout button without confirmation
export const SimpleLogoutButton: React.FC<LogoutButtonProps> = (props) => {
  return <LogoutButton {...props} confirmLogout={false} />;
};

export default LogoutButton;
