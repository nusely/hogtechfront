'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import React, { Suspense } from 'react';
import CheckmarkLoader from '@/components/loaders/CheckmarkLoader';

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
      <NavBar />
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense
          fallback={
            <div className="py-20 flex items-center justify-center">
              <CheckmarkLoader size={72} color="#FF7A19" speedMs={600} />
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


