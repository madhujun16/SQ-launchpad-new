import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Beautiful expanding circle SVG preloader with fade effect
export const Loader: React.FC<LoaderProps> = ({ size = 'lg', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        className={sizeClasses[size]} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200"
      >
        <circle 
          fill="none" 
          strokeOpacity="1" 
          stroke="#033D0A" 
          strokeWidth="0.5" 
          cx="100" 
          cy="100" 
          r="0"
        >
          <animate 
            attributeName="r" 
            calcMode="spline" 
            dur="2" 
            values="1;80" 
            keyTimes="0;1" 
            keySplines="0 .2 .5 1" 
            repeatCount="indefinite"
          />
          <animate 
            attributeName="stroke-width" 
            calcMode="spline" 
            dur="2" 
            values="0;25" 
            keyTimes="0;1" 
            keySplines="0 .2 .5 1" 
            repeatCount="indefinite"
          />
          <animate 
            attributeName="stroke-opacity" 
            calcMode="spline" 
            dur="2" 
            values="1;0" 
            keyTimes="0;1" 
            keySplines="0 .2 .5 1" 
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
      <div className="text-center">
        <Loader size="lg" />
        <div className="mt-6">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const ContentLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader size="lg" />
        <div className="mt-4">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-green-600 to-transparent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}; 