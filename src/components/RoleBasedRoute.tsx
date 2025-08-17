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
  const { currentRole, loading, availableRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentRole) {
      // Access check completed
      
      // Check if user can access the current page
      if (!canAccessPage(currentRole, location.pathname)) {
        console.warn(`Access denied for ${currentRole} to ${location.pathname}`);
        console.log('Current role:', currentRole);
        console.log('Available roles:', availableRoles);
        console.log('Page path:', location.pathname);
        
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
  }, [currentRole, loading, location.pathname, navigate, availableRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentRole) {
    // No current role found
    console.error('No current role found for user');
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage="No role assigned. Please contact an administrator."
      />
    );
  }

  // Check if user can access the current page
  const hasAccess = canAccessPage(currentRole, location.pathname);
  
  if (!hasAccess) {
    console.error(`Access denied for role ${currentRole} to page ${location.pathname}`);
    return (
      <AccessDenied 
        requiredRole={requiredRole}
        pageName={location.pathname}
        customMessage={`You don't have permission to access ${location.pathname} with your current role (${currentRole}).`}
      />
    );
  }

  // Access granted
  return <>{children}</>;
}; 