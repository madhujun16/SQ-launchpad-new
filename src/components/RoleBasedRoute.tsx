import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { canAccessPage } from '@/lib/roles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { currentRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentRole) {
      // Check if user can access the current page
      if (!canAccessPage(currentRole, location.pathname)) {
        // Redirect to dashboard if they don't have access
        navigate('/dashboard');
      }
    }
  }, [currentRole, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No role assigned. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canAccessPage(currentRole, location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <Alert className="max-w-md">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this page. Redirecting to dashboard...
        </AlertDescription>
      </Alert>
    </div>
    );
  }

  return <>{children}</>;
}; 