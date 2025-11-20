'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import React, { Suspense } from 'react';
import HedgehogLoader from '@/components/loaders/HedgehogLoader';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/callback',
  ];

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAdminRoute) {
    // Admin routes: No NavBar, No Footer, No MobileBottomNav
    return <>{children}</>;
  }

  if (isAuthRoute) {
    // Authentication routes: render without global chrome
    return <main className="flex-1">{children}</main>;
  }

  // Regular routes: With NavBar, Footer, and MobileBottomNav
  return (
    <>
      <AnnouncementBar />
      <NavBar />
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense
          fallback={
            <div className="min-h-screen flex flex-col items-center justify-center">
              <HedgehogLoader size={120} speedMs={700} />
              <p className="text-gray-600 mt-8 text-lg">Loading...</p>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}


