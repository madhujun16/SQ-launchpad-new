import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from './ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, currentRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  if (loading) {
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
};