'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Zap, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { getCategories } from '@/services/category.service';
import { Category } from '@/types/product';
import { FlashDeals } from '@/components/shop/FlashDeals';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { 
  getActiveFlashDeals, 
  getProductsForFlashDeal,
  FlashDeal 
} from '@/services/flashDeal.service';
import { CountdownTimer } from '@/components/shop/CountdownTimer';

export function DealsContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashDealCampaigns, setFlashDealCampaigns] = useState<Array<{
    deal: FlashDeal;
    products: Product[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [categoriesData, activeDeals] = await Promise.all([
          getCategories(),
          getActiveFlashDeals(),
        ]);
        
        setCategories(categoriesData.slice(0, 8));

        // Fetch products for each active flash deal campaign
        const campaignsWithProducts = await Promise.all(
          activeDeals.map(async (deal) => {
            const products = await getProductsForFlashDeal(deal.id);
            return { deal, products };
          })
        );

        setFlashDealCampaigns(campaignsWithProducts);
      } catch (error) {
        console.error('Error fetching deals page data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Zap className="text-white" size={20} />
            <span className="text-sm font-semibold text-white">HOT DEALS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Don&apos;t Miss Out on Amazing Deals!
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Shop the latest discounts and exclusive offers on top gadgets and electronics
          </p>
        </div>
      </section>

      {/* Flash Deals Campaigns Section */}
      {flashDealCampaigns.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          {flashDealCampaigns.map((campaign) => (
            <div key={campaign.deal.id} className="mb-12">
              {/* Campaign Header */}
              <div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-xl p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Zap className="text-white" size={18} />
                      <span className="text-sm font-semibold text-white">FLASH DEAL</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {campaign.deal.title}
                    </h2>
                    {campaign.deal.description && (
                      <p className="text-white/90 text-sm md:text-base mb-4">
                        {campaign.deal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-white mb-2 text-sm font-medium">Ends in:</div>
                    <CountdownTimer 
                      endTime={campaign.deal.end_time} 
                      variant="large"
                      showDays={true}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Products */}
              {campaign.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {campaign.products.map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} />
                      {(product as any).flash_deal_discount && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge variant="error" size="sm">
                            {(product as any).flash_deal_discount || 0}% OFF
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-[#3A3A3A]">No products in this deal yet</p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Flash Deals Section (Homepage style) */}
      <section className="container mx-auto px-4 py-12">
        <FlashDeals limit={12} />
      </section>

      {/* All Deals Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">All Deals</h2>
            <p className="text-[#3A3A3A] text-sm">Limited time offers - Shop before they&apos;re gone!</p>
          </div>
          <Link href="/shop?on_sale=true">
            <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : flashDealCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <TrendingDown className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-[#3A3A3A] mb-4">No deals available at the moment</p>
            <Link href="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {flashDealCampaigns.flatMap((campaign) =>
              campaign.products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {(product as any).flash_deal_discount && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant="error" size="sm">
                        {(product as any).flash_deal_discount || 0}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Shop Deals by Category */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">Shop Deals by Category</h2>
              <p className="text-[#3A3A3A] text-sm">Explore deals in your favorite categories</p>
            </div>
            <Link href="/categories">
              <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                View All Categories
              </Button>
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}?on_sale=true`}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <Zap className="text-[#FF7A19]" size={24} />
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] group-hover:text-[#FF7A19] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#3A3A3A] mt-2">View deals</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#3A3A3A] text-sm">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-2xl p-8 md:p-12 text-center text-white">
          <Clock className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Never Miss a Deal</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive deals, flash sales, and special offers!
          </p>
          <form className="max-w-md mx-auto flex flex-col gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" size="lg" type="submit" className="w-full sm:w-auto sm:mx-auto">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
