'use client';

import React from 'react';
import HedgehogLoader from './HedgehogLoader';

interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = "Loading your shopping experience...", 
  size = "lg" 
}) => {
  // Convert size string to number for HedgehogLoader
  const getSizeValue = (sizeStr: 'sm' | 'md' | 'lg'): number => {
    switch (sizeStr) {
      case 'sm': return 60;
      case 'md': return 80;
      case 'lg': return 120;
      default: return 100;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <HedgehogLoader size={getSizeValue(size)} />
        <p className="text-gray-600 mt-4 text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};
