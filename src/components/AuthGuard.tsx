import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Call useAuth hook at the top level (Rules of Hooks requirement)
  const { user, loading, currentRole } = useAuth();

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - proceeding with fallback');
        setAuthTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading state while auth is initializing (but with timeout)
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <div className="text-center">
          <Loader size="lg" className="text-white" />
          <p className="text-white mt-4">Authenticating...</p>
          <p className="text-white mt-2 text-sm">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // If auth times out, show a fallback UI
  if (authTimeout && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Authentication Timeout</h2>
            <p className="text-white/80 mb-4">
              The authentication system is taking longer than expected. This might be due to:
            </p>
            <ul className="text-white/70 text-sm mb-6 text-left space-y-1">
              <li>• Network connectivity issues</li>
              <li>• Database connection problems</li>
              <li>• Authentication service delays</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry Authentication
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated (unless on auth page)
  if (!user && location.pathname !== '/auth') {
    return null;
  }

  // Allow access even if currentRole is not set (for now)
  // This prevents the infinite loading issue
  return <>{children}</>;
};

export default AuthGuard;