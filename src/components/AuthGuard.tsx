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
  const { user, loading, refreshing, currentRole } = useAuth();

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
      if (loading && !refreshing) {
        console.warn('⚠️ Auth loading timeout - proceeding with fallback');
        setAuthTimeout(true);
      }
    }, 10000); // Increased to 10 seconds to allow more time for session restoration

    return () => clearTimeout(timeoutId);
  }, [loading, refreshing]);

  // Handle redirect to auth page when no user is found
  useEffect(() => {
    // Give session restoration more time by checking for localStorage session indicators
    const hasSessionIndicator = () => {
      try {
        // Check for various Supabase session storage patterns
        const supabaseKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') && key.includes('auth-token')
        );
        const smartqAuth = localStorage.getItem('smartq-launchpad-auth');
        
        // Also check for any auth-related localStorage keys
        const hasAnyAuthData = supabaseKeys.length > 0 || !!smartqAuth;
        
        if (hasAnyAuthData) {
          console.log('✅ Session indicator found in localStorage');
        }
        
        return hasAnyAuthData;
      } catch (e) {
        console.warn('⚠️ Error checking session indicator:', e);
        return false;
      }
    };

    // Only redirect if we're truly not loading/refreshing AND there's no session indicator
    // Add a delay to allow session restoration to complete, especially on page refresh
    const redirectTimer = setTimeout(() => {
      if (!loading && !refreshing && !user && location.pathname !== '/auth' && !hasRedirected) {
        // Double-check session indicator before redirecting
        const hasSession = hasSessionIndicator();
        
        if (!hasSession) {
          console.log('🔄 No user found and no session indicator, redirecting to auth page');
          setHasRedirected(true);
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectAfterAuth', location.pathname + location.search);
          navigate('/auth', { replace: true });
        } else {
          console.log('⏳ Session indicator found, waiting longer for session restoration...');
          // If session indicator exists but no user yet, give it more time
          // Don't redirect - let it try to restore
        }
      }
    }, 2000); // Give 2 seconds for session to restore on refresh

    return () => clearTimeout(redirectTimer);
  }, [user, loading, refreshing, navigate, location.pathname, location.search, hasRedirected]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (user) {
      setHasRedirected(false);
    }
  }, [user]);

  // If we're not loading and there's no user, check for session indicator before showing nothing
  // Give session restoration a chance to complete
  const hasSessionIndicator = () => {
    try {
      // Check for various Supabase session storage patterns
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') && key.includes('auth-token')
      );
      const smartqAuth = localStorage.getItem('smartq-launchpad-auth');
      return supabaseKeys.length > 0 || !!smartqAuth;
    } catch {
      return false;
    }
  };

  // Don't render null (which might cause redirect) if we have a session indicator
  // This gives time for session restoration to complete
  if (!loading && !refreshing && !user && location.pathname !== '/auth') {
    if (hasSessionIndicator()) {
      // Session indicator exists, show loading to wait for restoration
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <Loader size="lg" message="Restoring session..." />
            <p className="text-gray-500 mt-4">Please wait while we restore your session</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Show loading state while auth is initializing or refreshing (but with timeout)
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

  // If auth times out, show a fallback UI
  if (authTimeout && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Timeout</h2>
            <p className="text-gray-700 mb-4">
              The authentication system is taking longer than expected. This might be due to:
            </p>
            <ul className="text-gray-600 text-sm mb-6 text-left space-y-1">
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
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

  // Don't render children if user is not authenticated (unless on auth page or refreshing)
  if (!user && location.pathname !== '/auth' && !refreshing) {
    return null;
  }

  // Allow access even if currentRole is not set (for now)
  // This prevents the infinite loading issue
  return <>{children}</>;
};

export default AuthGuard;