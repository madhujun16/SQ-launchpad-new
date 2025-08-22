import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Elegant SVG preloader with dark green theme matching the website
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
          fill="#033D0A" 
          stroke="#033D0A" 
          strokeWidth="15" 
          r="15" 
          cx="35" 
          cy="100"
        >
          <animate 
            attributeName="cx" 
            calcMode="spline" 
            dur="2" 
            values="35;165;165;35;35" 
            keySplines="0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1" 
            repeatCount="indefinite" 
            begin="0"
          />
        </circle>
        <circle 
          fill="#033D0A" 
          stroke="#033D0A" 
          strokeWidth="15" 
          opacity=".8" 
          r="15" 
          cx="35" 
          cy="100"
        >
          <animate 
            attributeName="cx" 
            calcMode="spline" 
            dur="2" 
            values="35;165;165;35;35" 
            keySplines="0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1" 
            repeatCount="indefinite" 
            begin="0.05"
          />
        </circle>
        <circle 
          fill="#033D0A" 
          stroke="#033D0A" 
          strokeWidth="15" 
          opacity=".6" 
          r="15" 
          cx="35" 
          cy="100"
        >
          <animate 
            attributeName="cx" 
            calcMode="spline" 
            dur="2" 
            values="35;165;165;35;35" 
            keySplines="0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1" 
            repeatCount="indefinite" 
            begin=".1"
          />
        </circle>
        <circle 
          fill="#033D0A" 
          stroke="#033D0A" 
          strokeWidth="15" 
          opacity=".4" 
          r="15" 
          cx="35" 
          cy="100"
        >
          <animate 
            attributeName="cx" 
            calcMode="spline" 
            dur="2" 
            values="35;165;165;35;35" 
            keySplines="0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1" 
            repeatCount="indefinite" 
            begin=".15"
          />
        </circle>
        <circle 
          fill="#033D0A" 
          stroke="#033D0A" 
          strokeWidth="15" 
          opacity=".2" 
          r="15" 
          cx="35" 
          cy="100"
        >
          <animate 
            attributeName="cx" 
            calcMode="spline" 
            dur="2" 
            values="35;165;165;35;35" 
            keySplines="0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1" 
            repeatCount="indefinite" 
            begin=".2"
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