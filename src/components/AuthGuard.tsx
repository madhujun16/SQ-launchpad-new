import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/loader';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  
  // Call useAuth hook at the top level (Rules of Hooks requirement)
  const { user, loading, currentRole } = useAuth();

  // Detect browser and log info
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edge');
    const isEdge = userAgent.includes('Edge');
    const browserType = isChrome ? 'Chrome' : isEdge ? 'Edge' : 'Other';
    
    setBrowserInfo(browserType);
    console.log('🌐 Browser detected:', browserType);
    console.log('🔧 User Agent:', userAgent);
    
    // Check for common Chrome issues
    if (isChrome) {
      console.log('⚠️ Chrome detected - checking for potential issues...');
      
      // Check if extensions might be interfering
      if (isChrome && (window as any).chrome?.runtime) {
        console.log('🔌 Chrome extensions detected');
      }
      
      // Check localStorage quota
      try {
        const testData = 'x'.repeat(1024 * 1024); // 1MB test
        localStorage.setItem('chrome-test', testData);
        localStorage.removeItem('chrome-test');
        console.log('✅ Chrome localStorage quota OK');
      } catch (quotaError) {
        console.error('❌ Chrome localStorage quota error:', quotaError);
      }
    }
  }, []);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Auth loading timeout - proceeding with fallback');
        setAuthTimeout(true);
      }
    }, 8000); // Reduced to 8 seconds for faster response

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Handle redirect to auth page when no user is found
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth' && !hasRedirected) {
      console.log('🔄 No user found, redirecting to auth page');
      setHasRedirected(true);
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, location.pathname, hasRedirected]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (user) {
      setHasRedirected(false);
    }
  }, [user]);

  // If we're not loading and there's no user, show nothing while redirecting
  if (!loading && !user && location.pathname !== '/auth') {
    return null;
  }

  // Show loading state while auth is initializing (but with timeout)
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-loading-background">
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
      <div className="min-h-screen flex items-center justify-center auth-loading-background">
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
              <li>• First-time access from this device</li>
              <li>• Browser cache or session issues</li>
              {browserInfo === 'Chrome' && (
                <>
                  <li>• Chrome extension interference</li>
                  <li>• Chrome security policy restrictions</li>
                  <li>• Chrome localStorage quota issues</li>
                </>
              )}
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear any cached auth data and reload
                  localStorage.removeItem('smartq-launchpad-auth');
                  window.location.reload();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Cache & Retry
              </button>
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
                Simple Retry
              </button>
              {browserInfo === 'Chrome' && (
                <button
                  onClick={() => {
                    // Chrome-specific troubleshooting
                    console.log('🔧 Chrome troubleshooting initiated');
                    
                    // Clear all localStorage
                    try {
                      localStorage.clear();
                      console.log('🧹 Cleared all localStorage');
                    } catch (e) {
                      console.error('❌ Failed to clear localStorage:', e);
                    }
                    
                    // Clear sessionStorage
                    try {
                      sessionStorage.clear();
                      console.log('🧹 Cleared all sessionStorage');
                    } catch (e) {
                      console.error('❌ Failed to clear sessionStorage:', e);
                    }
                    
                    // Reload with cache bypass
                    window.location.reload();
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Chrome Troubleshooting
                </button>
              )}
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