
import React, { useEffect, useState } from 'react';
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
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  useEffect(() => {
    if (!loading && currentRole && !hasCheckedAccess) {
      console.log('🔍 RoleBasedRoute access check:', {
        currentRole,
        pathname: location.pathname,
        availableRoles
      });
      
      // Check if user can access the current page
      const hasAccess = canAccessPage(currentRole, location.pathname);
      
      if (!hasAccess) {
        console.warn(`❌ Access denied for ${currentRole} to ${location.pathname}`);
        // Only redirect if we haven't already checked to prevent loops
        navigate('/dashboard', { replace: true });
      }
      
      setHasCheckedAccess(true);
    }
  }, [currentRole, loading, location.pathname, navigate, availableRoles, hasCheckedAccess]);

  // Reset access check when location changes
  useEffect(() => {
    setHasCheckedAccess(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentRole) {
    console.error('❌ No current role found for user');
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage="No role assigned. Please contact an administrator."
      />
    );
  }

  // Check if user can access the current page
  const hasAccess = canAccessPage(currentRole, location.pathname);
  
  if (!hasAccess && hasCheckedAccess) {
    console.error(`❌ Access denied for role ${currentRole} to page ${location.pathname}`);
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage={`Access denied. Your role (${currentRole}) does not have permission to access this page.`}
      />
    );
  }

  // Access granted or still checking
  return <>{children}</>;
};
