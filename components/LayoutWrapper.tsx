'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navigation/NavBar';
import React, { Suspense } from 'react';
import CheckmarkLoader from '@/components/loaders/CheckmarkLoader';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes: No NavBar, No Footer
    return <>{children}</>;
  }

  // Regular routes: With NavBar and Footer
  return (
    <>
      <NavBar />
      <main className="flex-1">
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
      <footer className="bg-[#1A1A1A] text-white py-8 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#FF7A19]">VENTECH</h3>
              <p className="text-sm text-gray-400">Your trusted tech partner in Ghana</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/categories" className="hover:text-[#FF7A19]">All Products</a></li>
                <li><a href="/deals" className="hover:text-[#FF7A19]">Deals</a></li>
                <li><a href="/categories" className="hover:text-[#FF7A19]">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/contact" className="hover:text-[#FF7A19]">Contact Us</a></li>
                <li><a href="/faq" className="hover:text-[#FF7A19]">FAQ</a></li>
                <li><a href="/shipping" className="hover:text-[#FF7A19]">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-[#FF7A19]">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-[#FF7A19]">Terms of Service</a></li>
                <li><a href="/returns" className="hover:text-[#FF7A19]">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-gray-400">&copy; 2025 VENTECH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}


