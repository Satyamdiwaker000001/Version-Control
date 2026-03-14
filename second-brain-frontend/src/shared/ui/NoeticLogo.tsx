import React from 'react';
import { cn } from '@/shared/utils/cn';

export const NoeticLogo = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
    >
      {/* Background Aura */}
      <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.05" />
      
      {/* Central Core */}
      <circle cx="16" cy="16" r="4" fill="currentColor" className="animate-pulse" />
      
      {/* Neural Pathways */}
      <g className="stroke-current opacity-40" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 4V12" />
        <path d="M16 20V28" />
        <path d="M4 16H12" />
        <path d="M20 16H28" />
        
        {/* Diagonals */}
        <path d="M8 8L13 13" />
        <path d="M19 19L24 24" />
        <path d="M8 24L13 19" />
        <path d="M19 13L24 8" />
      </g>
      
      {/* Nodes */}
      <g fill="currentColor">
        <circle cx="16" cy="6" r="2" />
        <circle cx="16" cy="26" r="2" />
        <circle cx="6" cy="16" r="2" />
        <circle cx="26" cy="16" r="2" />
        
        {/* Outer Diagonal Nodes */}
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="23" cy="23" r="1.5" />
        <circle cx="9" cy="23" r="1.5" />
        <circle cx="23" cy="9" r="1.5" />
      </g>
      
      {/* Brain/Intellect Symbolism - Simplified lobes */}
      <path 
        d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2ZM16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28Z" 
        fill="currentColor" 
        fillOpacity="0.1"
      />
    </svg>
  );
};
