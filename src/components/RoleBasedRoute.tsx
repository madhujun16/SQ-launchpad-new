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
      console.log('RoleBasedRoute Debug:', {
        currentRole,
        pathname: location.pathname,
        canAccess: canAccessPage(currentRole, location.pathname)
      });
      
      // Check if user can access the current page
      if (!canAccessPage(currentRole, location.pathname)) {
        console.log('Access denied, redirecting to dashboard');
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
    console.log('No current role found');
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

  // Temporarily allow access to all pages for debugging
  const hasAccess = canAccessPage(currentRole, location.pathname);
  console.log(`Access check for ${location.pathname}: ${hasAccess}`);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Redirecting to dashboard...
            <br />
            <small>Role: {currentRole}, Page: {location.pathname}</small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}; 