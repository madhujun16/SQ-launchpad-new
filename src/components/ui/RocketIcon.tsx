import React from 'react';

interface RocketIconProps {
  size?: number;
  className?: string;
  color?: string;
}

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
      {/* Rocket body (vibrant light olive green, smooth rounded shape) */}
      <ellipse cx="48" cy="40" rx="10" ry="22" fill="#9ACD32"/>
      
      {/* Rocket nose cone (rounded top) */}
      <ellipse cx="48" cy="18" rx="7" ry="10" fill="#6B8E23"/>
      
      {/* Left fin (triangular, integrated with body, rounded edges) */}
      <path d="M38 45 Q28 58 32 62 Q38 58 38 50 Z" fill="#9ACD32"/>
      
      {/* Right fin (triangular, integrated with body, rounded edges) */}
      <path d="M58 45 Q68 58 64 62 Q58 58 58 50 Z" fill="#9ACD32"/>
      
      {/* Rocket base (rounded bottom) */}
      <ellipse cx="48" cy="62" rx="7" ry="5" fill="#6B8E23"/>
      
      {/* Outer flame (vibrant orange, soft rounded V-shape) */}
      <path d="M48 67 Q40 85 48 92 Q56 85 48 67 Z" fill="#FF8C00"/>
      
      {/* Inner flame (bright sunny yellow, rounded teardrop) */}
      <ellipse cx="48" cy="80" rx="4" ry="10" fill="#FFD700"/>
    </svg>
  );
};

export default RocketIcon;
