import React, { useEffect, useState } from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

// Optimized loader with Chrome-specific enhancements
export const Loader: React.FC<LoaderProps> = ({ size = 'lg', className = '', message }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay visibility to prevent flash on fast loads
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  if (!isVisible) {
    return <div className={`${sizeClasses[size]} ${className}`} />;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        className={`${sizeClasses[size]} animate-spin`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      {message && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export const PageLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      setLoadingTime(Math.round(performance.now() - startTime));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto px-4">
        <Loader size="lg" message={message} />
        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            {loadingTime > 3000 && "This is taking longer than usual..."}
            {loadingTime > 5000 && "Please check your internet connection"}
          </p>
          {loadingTime > 10000 && (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ContentLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-50">
      <div className="text-center">
        <Loader size="md" message={message} />
      </div>
    </div>
  );
}; 