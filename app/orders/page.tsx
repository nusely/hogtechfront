'use client';

import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#3A3A3A] mb-6">
          <Link href="/" className="hover:text-[#FF7A19]">Home</Link>
          <ChevronRight size={16} />
          <span className="text-[#FF7A19]">My Orders</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">My Orders</h1>
          <p className="text-[#3A3A3A]">View and track your order history</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-[#FF7A19]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">No Orders Yet</h2>
          <p className="text-[#3A3A3A] mb-6 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#FF7A19] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8C3A] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
