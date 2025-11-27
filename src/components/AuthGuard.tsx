// TODO: Connect to GCP backend authentication APIs
// TODO: Implement GCP Auth integration

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const { user, loading, refreshing, currentRole } = useAuth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !refreshing) {
        console.warn('⚠️ Auth loading timeout - proceeding with fallback');
        setAuthTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loading, refreshing]);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      if (!loading && !refreshing && !user && location.pathname !== '/auth' && !hasRedirected) {
        console.log('🔄 No user found, redirecting to auth page');
          setHasRedirected(true);
          sessionStorage.setItem('redirectAfterAuth', location.pathname + location.search);
          navigate('/auth', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [user, loading, refreshing, navigate, location.pathname, location.search, hasRedirected]);

  useEffect(() => {
    if (user) {
      setHasRedirected(false);
    }
  }, [user]);

  if (!loading && !refreshing && !user && location.pathname !== '/auth') {
    return null;
  }

  if ((loading || refreshing) && !authTimeout) {
    const message = refreshing ? "Refreshing session..." : "Authenticating...";
    const subMessage = refreshing ? "Updating your authentication" : "Setting up your secure session";
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader size="lg" message={message} />
          <p className="text-gray-500 mt-4">{subMessage}</p>
          <p className="text-gray-400 mt-2 text-sm">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (authTimeout && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-700 mb-4">
              Authentication is not yet configured. Please connect to your GCP backend.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth' && !refreshing) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
