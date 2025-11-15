'use client';

import React from 'react';
import CheckmarkLoader from '@/components/loaders/CheckmarkLoader';

export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <CheckmarkLoader size={72} color="#00afef" speedMs={600} />
    </div>
  );
}


