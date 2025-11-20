'use client';

import React from 'react';
import HedgehogLoader from '@/components/loaders/HedgehogLoader';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <HedgehogLoader size={140} speedMs={700} />
      <p className="text-gray-700 mt-8 text-xl font-medium">Loading your experience...</p>
    </div>
  );
}


