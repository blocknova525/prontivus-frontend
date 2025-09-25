import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "@/lib/api";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  allowedUserTypes?: string[];
  redirectTo?: string;
}

const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  allowedUserTypes = [],
  redirectTo 
}: RoleGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Determine which API method to use based on stored user type
        const userType = localStorage.getItem('user_type') || 'staff';
        let userData;
        
        try {
          userData = userType === 'patient' 
            ? await apiService.getCurrentPatient()
            : await apiService.getCurrentUser();
        } catch (apiError: any) {
          console.warn('RoleGuard - API call failed, using fallback:', apiError);
          // Fallback: create minimal user data from stored info
          userData = {
            user_type: userType,
            user_role: userType === 'patient' ? 'patient' : 'staff'
          };
        }
        
        setUserInfo(userData);
        
          // Debug logging
          console.log('RoleGuard - User data:', userData);
          console.log('RoleGuard - User type from data:', userData.type);
          console.log('RoleGuard - User role from data:', userData.role);
        console.log('RoleGuard - Allowed user types:', allowedUserTypes);
        console.log('RoleGuard - Allowed roles:', allowedRoles);
        
          // Check if user type is allowed
          const userTypeAllowed = allowedUserTypes.length === 0 || 
            allowedUserTypes.includes(userData.type || 'staff');
          
          // Check if user role is allowed
          const userRoleAllowed = allowedRoles.length === 0 || 
            allowedRoles.includes(userData.role || 'staff');
        
        // Administrators have access to all pages
        const isAdmin = userData.role === 'admin';
        
        // For staff routes, be more permissive - allow any staff user
        const isStaffRoute = allowedUserTypes.includes('staff');
        const isStaffUser = userData.type === 'staff' || userData.role === 'staff' || userData.role === 'admin' || userData.role === 'doctor' || userData.role === 'secretary';
        
        const isAllowed = isAdmin || (userTypeAllowed && userRoleAllowed) || (isStaffRoute && isStaffUser);
        
        // Debug authorization logic
        console.log('RoleGuard - userTypeAllowed:', userTypeAllowed);
        console.log('RoleGuard - userRoleAllowed:', userRoleAllowed);
        console.log('RoleGuard - isAdmin:', isAdmin);
        console.log('RoleGuard - isStaffRoute:', isStaffRoute);
        console.log('RoleGuard - isStaffUser:', isStaffUser);
        console.log('RoleGuard - isAllowed:', isAllowed);
        
        if (!isAllowed) {
          console.log('RoleGuard - Access denied, redirecting...');
          // Redirect based on user type
          if (userData.type === 'patient') {
            console.log('RoleGuard - Redirecting patient to /patient/dashboard');
            navigate('/patient/dashboard');
          } else {
            console.log('RoleGuard - Redirecting staff user...');
            // Redirect staff to appropriate dashboard based on role
            switch (userData.role) {
              case 'admin':
                console.log('RoleGuard - Redirecting admin to /admin');
                navigate('/admin');
                break;
              case 'doctor':
                console.log('RoleGuard - Redirecting doctor to /atendimento');
                navigate('/atendimento');
                break;
              case 'secretary':
                console.log('RoleGuard - Redirecting secretary to /secretaria');
                navigate('/secretaria');
                break;
              case 'finance':
                console.log('RoleGuard - Redirecting finance to /financeiro');
                navigate('/financeiro');
                break;
              default:
                console.log('RoleGuard - Redirecting to default /dashboard');
                navigate('/dashboard');
            }
          }
          return;
        }
        
        console.log('RoleGuard - Access granted, showing content');
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authorization:', error);
        // If there's an error getting user info, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }
    };

    checkAuthorization();
  }, [navigate, allowedRoles, allowedUserTypes]);

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Show children only if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Return null if not authorized (will redirect)
  return null;
};

export default RoleGuard;
