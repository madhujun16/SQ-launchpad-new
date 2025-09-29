
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { canAccessPage } from '@/lib/roles';
import { AccessDenied } from './AccessDenied';
import { Loader } from './ui/loader';

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
  const [accessTimeout, setAccessTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('RoleBasedRoute loading timeout - proceeding with fallback');
        setAccessTimeout(true);
      }
    }, 15000); // Increased to 15 seconds for better UX

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if ((!loading || accessTimeout) && currentRole && !hasCheckedAccess) {
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
  }, [currentRole, loading, location.pathname, navigate, availableRoles, hasCheckedAccess, accessTimeout]);

  // Reset access check when location changes
  useEffect(() => {
    setHasCheckedAccess(false);
    setAccessTimeout(false);
  }, [location.pathname]);

  // Show loading state if still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader size="lg" message="Setting up your workspace..." />
          <p className="text-gray-500 mt-4">Loading your role and permissions</p>
          <p className="text-gray-400 mt-2 text-sm">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Only show access denied if we're done loading and still no role
  if (!currentRole && !loading && !accessTimeout) {
    console.error('❌ No current role found for user');
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage="No role assigned. Please contact an administrator."
      />
    );
  }

  // If no currentRole but not done loading, show loading
  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader size="lg" message="Setting up your role..." />
          <p className="text-gray-500 mt-4">Loading user permissions</p>
          <p className="text-gray-400 mt-2 text-sm">This may take a moment</p>
        </div>
      </div>
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
