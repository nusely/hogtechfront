'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { Zap, TrendingDown, Clock, ArrowRight } from 'lucide-react';

export default function DealsPage() {
  // Mock data - will be replaced with real data
  const deals = [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Zap className="fill-white" size={20} />
              <span className="text-sm font-semibold">HOT DEALS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Amazing Deals & Discounts
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Don't miss out on our limited-time offers. Save big on the latest tech!
            </p>
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="text-[#FF7A19]" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Flash Deals</h2>
              <p className="text-sm text-[#3A3A3A]">Limited time offers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#FF7A19] text-white px-4 py-2 rounded-lg">
            <Clock size={18} />
            <span className="font-bold text-sm">Ends in: 12:45:30</span>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <Zap className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-[#3A3A3A] mb-4">No flash deals available right now</p>
            <p className="text-sm text-[#3A3A3A] mb-6">Check back soon for amazing offers!</p>
            <Link href="/categories">
              <Button variant="primary">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Daily Deals */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="text-[#FF7A19]" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Daily Deals</h2>
              <p className="text-sm text-[#3A3A3A]">Best prices of the day</p>
            </div>
          </div>

          <div className="text-center py-16 bg-white rounded-xl">
            <TrendingDown className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-[#3A3A3A] mb-4">Daily deals coming soon!</p>
            <Link href="/categories">
              <Button variant="outline">Explore Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Deal Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Shop Deals by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Smartphones', 'Laptops', 'Accessories', 'Smartwatches'].map((category) => (
            <Link key={category} href={`/categories/${category.toLowerCase()}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-[#FF7A19] hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="text-[#FF7A19]" size={24} />
                </div>
                <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">{category}</h3>
                <p className="text-xs text-[#FF7A19] font-medium">View Deals →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder/bg-gadgets1.webp')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative text-center text-white p-12">
              <h2 className="text-2xl font-bold mb-3">Never Miss a Deal</h2>
              <p className="text-white/90 text-sm mb-6">
                Subscribe to get notified about our latest offers
              </p>
              <div className="max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-transparent border border-white text-white placeholder:white/80 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button variant="primary">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


