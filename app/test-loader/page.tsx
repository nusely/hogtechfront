'use client';

import React from 'react';
import HedgehogLoader from '@/components/loaders/HedgehogLoader';
import CheckmarkLoader from '@/components/loaders/CheckmarkLoader';

export default function TestLoaderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Loader Comparison
        </h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Old Checkmark Loader */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              Old Checkmark Loader
            </h2>
            <div className="flex-1 flex items-center justify-center py-12">
              <CheckmarkLoader size={100} color="#00afef" speedMs={600} />
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Simple animated checkmark
            </p>
          </div>

          {/* New Hedgehog Loader */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              New Hedgehog Loader ⭐
            </h2>
            <div className="flex-1 flex items-center justify-center py-12">
              <HedgehogLoader size={120} speedMs={700} />
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Cute fluffy hedgehog walking with a smile!
            </p>
          </div>
        </div>

        {/* Different sizes */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700">
            Hedgehog Loader - Different Sizes
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-end justify-around gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={40} speedMs={600} />
                <span className="text-xs text-gray-500">Small (40px)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={60} speedMs={600} />
                <span className="text-xs text-gray-500">Medium (60px)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={80} speedMs={600} />
                <span className="text-xs text-gray-500">Default (80px)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={120} speedMs={600} />
                <span className="text-xs text-gray-500">Large (120px)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={160} speedMs={600} />
                <span className="text-xs text-gray-500">Extra Large (160px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Different speeds */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700">
            Hedgehog Loader - Different Speeds
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-around gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={80} speedMs={1200} />
                <span className="text-xs text-gray-500">Slow (1200ms)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={80} speedMs={800} />
                <span className="text-xs text-gray-500">Normal (800ms)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <HedgehogLoader size={80} speedMs={400} />
                <span className="text-xs text-gray-500">Fast (400ms)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background variations */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700">
            Hedgehog Loader - Background Variations
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center h-64">
              <HedgehogLoader size={100} speedMs={600} />
              <span className="text-xs text-gray-500 mt-4">White Background</span>
            </div>
            <div className="bg-gray-100 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center h-64">
              <HedgehogLoader size={100} speedMs={600} />
              <span className="text-xs text-gray-500 mt-4">Gray Background</span>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center h-64">
              <HedgehogLoader size={100} speedMs={600} />
              <span className="text-xs text-gray-500 mt-4">Gradient Background</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            ✅ Implementation Complete
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Created HedgehogLoader component with brand colors (#00afef, #163b86)</li>
            <li>✅ Replaced CheckmarkLoader in LayoutWrapper.tsx</li>
            <li>✅ Replaced CheckmarkLoader in app/loading.tsx</li>
            <li>✅ SVG-based with smooth CSS animations</li>
            <li>✅ Fully customizable size and speed</li>
            <li>✅ Accessible with ARIA labels</li>
          </ul>
          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Usage:</p>
            <code className="text-xs bg-gray-100 p-3 rounded block">
              {`import HedgehogLoader from '@/components/loaders/HedgehogLoader';\n\n<HedgehogLoader size={80} speedMs={600} />`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

