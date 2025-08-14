import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { canAccessPage } from '@/lib/roles';
import { AccessDenied } from './AccessDenied';

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
      // Access check completed
      
      // Check if user can access the current page
      if (!canAccessPage(currentRole, location.pathname)) {
        // Access denied, redirecting to dashboard
        // Only redirect if it's not a loading state and we're sure they don't have access
        if (!loading) {
          // Add a small delay to prevent immediate redirect
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
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
    // No current role found
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage="No role assigned. Please contact an administrator."
      />
    );
  }

  // Check if user can access the current page
  const hasAccess = canAccessPage(currentRole, location.pathname);
  // Access check completed

  if (!hasAccess) {
    return (
      <AccessDenied 
        requiredRole={requiredRole}
        pageName={location.pathname}
        customMessage={`You don't have permission to access ${location.pathname}.`}
      />
    );
  }

  return <>{children}</>;
}; 