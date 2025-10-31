
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { canAccessPage } from '@/lib/roles';
import { AccessDenied } from './AccessDenied';
import { Loader, AuthLoader } from './ui/loader';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { currentRole, loading, refreshing, availableRoles, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const [accessTimeout, setAccessTimeout] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading && !refreshing) {
        console.warn('RoleBasedRoute loading timeout - proceeding with fallback');
        setAccessTimeout(true);
      }
    }, 15000); // Increased to 15 seconds for better UX

    return () => clearTimeout(timeoutId);
  }, [loading, refreshing]);

  // Track refresh token operations
  useEffect(() => {
    if (refreshing) {
      setIsRefreshingToken(true);
      console.log('🔄 Token refresh detected, showing loader...');
    } else {
      // Add a small delay before hiding refresh indicator to prevent flash
      const timer = setTimeout(() => {
        setIsRefreshingToken(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [refreshing]);

  useEffect(() => {
    if ((!loading || accessTimeout) && currentRole && !hasCheckedAccess && !refreshing) {
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
  }, [currentRole, loading, refreshing, location.pathname, navigate, availableRoles, hasCheckedAccess, accessTimeout]);

  // Reset access check when location changes
  useEffect(() => {
    setHasCheckedAccess(false);
    setAccessTimeout(false);
  }, [location.pathname]);

  // Show loading state if still loading or refreshing token
  if (loading || isRefreshingToken) {
    const message = isRefreshingToken 
      ? "Refreshing your session" 
      : "Setting up your workspace";
    const subMessage = isRefreshingToken 
      ? "Please wait while we update your authentication" 
      : "Loading your role and permissions";
    
    return (
      <AuthLoader 
        message={message}
        subMessage={subMessage}
        showProgress={isRefreshingToken}
      />
    );
  }

  // If no currentRole but still loading or refreshing, show loading
  if (!currentRole && (loading || refreshing)) {
    return (
      <AuthLoader 
        message="Setting up your role"
        subMessage="Loading user permissions"
        showProgress={refreshing}
      />
    );
  }

  // Handle race condition for role loading
  useEffect(() => {
    if (!currentRole && !loading && !refreshing && user) {
      const timer = setTimeout(() => {
        if (!currentRole && !loading && !refreshing) {
          setShowAccessDenied(true);
        }
      }, 1500); // Wait 1.5 seconds before showing access denied
      
      return () => clearTimeout(timer);
    } else {
      setShowAccessDenied(false);
    }
  }, [currentRole, loading, refreshing, user]);

  // Only show access denied if we're completely done loading, not refreshing, and have a user but no role
  if (!currentRole && !loading && !refreshing && !accessTimeout && user && showAccessDenied) {
    console.error('❌ No current role found for user after delay');
    return (
      <AccessDenied 
        pageName={location.pathname}
        customMessage="No role assigned. Please contact an administrator."
      />
    );
  }

  // Show loading while waiting for role to load (race condition handling)
  if (!currentRole && !loading && !refreshing && user && !showAccessDenied) {
    return (
      <AuthLoader 
        message="Verifying permissions"
        subMessage="Please wait while we check your access"
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
