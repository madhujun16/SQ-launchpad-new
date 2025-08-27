import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from './ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔧 AuthGuard: Component rendering');
  
  try {
    const authData = useAuth();
    console.log('🔧 AuthGuard: useAuth result:', authData);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Destructure with safe defaults
    const { user, loading, currentRole } = authData || {};
    
    // Additional safety check for context availability
    if (!authData || typeof authData.loading === 'undefined') {
      console.log('🔧 AuthGuard: Context not ready, showing loader');
      return (
        <div className="min-h-screen flex items-center justify-center bg-white/90">
          <Loader size="lg" />
        </div>
      );
    }

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (!loading && user && currentRole) {
      // User is authenticated and has a role, allow access
      console.log('✅ AuthGuard: User authenticated with role:', currentRole);
    }
  }, [user, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!loading && user && currentRole) {
      // User is authenticated and has a role, allow access
      console.log('✅ AuthGuard: User authenticated with role:', currentRole);
    }
  }, [currentRole, loading, user, navigate, location.pathname]);

  // Show loading state if context is not ready or auth is loading
  if (!authData || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return null;
  }

    return <>{children}</>;
  } catch (error) {
    console.error('🔧 AuthGuard: Error in component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <div className="text-red-600 mb-4">Authentication Error</div>
          <div className="text-gray-600">Please refresh the page</div>
        </div>
      </div>
    );
  }
};

export default AuthGuard;