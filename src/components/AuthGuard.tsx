import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Call useAuth hook at the top level (Rules of Hooks requirement)
  const { user, loading, currentRole } = useAuth();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (!loading && user && currentRole) {
      // User is authenticated and has a role, allow access
    }
  }, [user, loading, navigate, location.pathname, currentRole]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <div className="text-center">
          <Loader size="lg" className="text-white" />
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated (unless on auth page)
  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;