import React from 'react';

interface RocketIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * RocketIcon Component - 3D Stylized Rocket
 * 
 * Sizing Recommendations:
 * - Favicon: 96x96px (default)
 * - Header Logo: 32-40px (h-8 w-8 sm:h-10 sm:w-10)
 * - Landing Page: 48px (h-12 w-12)
 * - Auth Form: 24px (w-6 h-6)
 * - Mobile Navigation: 24px (w-6 h-6)
 * - Cards/Widgets: 32px (h-8 w-8)
 * - Buttons: 16-20px (h-4 w-4 or h-5 w-5)
 * - Icons in Text: 16px (h-4 w-4)
 */
export const RocketIcon: React.FC<RocketIconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 96 96" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background - transparent */}
      <rect width="96" height="96" fill="transparent"/>
      
      {/* Rocket body - 3D glossy olive green with gradients */}
      <defs>
        <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#9ACD32', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#8FBC8F', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#6B8E23', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="noseCone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#9ACD32', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#556B2F', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="flameOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#FF8C00', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#FF6347', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="flameInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#FFD700', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#FFA500', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Rocket body - elongated oval with 3D effect */}
      <ellipse cx="48" cy="42" rx="12" ry="24" fill="url(#rocketBody)" />
      
      {/* Rocket nose cone - rounded top with gradient */}
      <ellipse cx="48" cy="18" rx="8" ry="12" fill="url(#noseCone)" />
      
      {/* Left fin - triangular, integrated with body */}
      <path d="M36 48 Q24 62 28 68 Q36 64 36 54 Z" fill="url(#rocketBody)" />
      
      {/* Right fin - triangular, integrated with body */}
      <path d="M60 48 Q72 62 68 68 Q60 64 60 54 Z" fill="url(#rocketBody)" />
      
      {/* Rocket base - rounded bottom */}
      <ellipse cx="48" cy="66" rx="8" ry="6" fill="url(#noseCone)" />
      
      {/* Outer flame - vibrant orange, dynamic shape */}
      <path d="M48 72 Q38 88 48 96 Q58 88 48 72 Z" fill="url(#flameOuter)" />
      
      {/* Inner flame - bright yellow, triangular core */}
      <path d="M48 76 L44 88 L48 84 L52 88 Z" fill="url(#flameInner)" />
      
      {/* 3D highlights for glossy effect */}
      <ellipse cx="44" cy="38" rx="4" ry="8" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="52" cy="18" rx="2" ry="4" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
};

export default RocketIcon;
