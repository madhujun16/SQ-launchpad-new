import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Consistent big green circle loader for the entire website
export const Loader: React.FC<LoaderProps> = ({ size = 'lg', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-green-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader size="lg" />
    </div>
  );
};

export const ContentLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader size="lg" />
    </div>
  );
}; 