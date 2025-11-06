'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { FlashDeal } from '@/services/flashDeal.service';
import { getActiveFlashDeals, getProductsForFlashDeal } from '@/services/flashDeal.service';
import { CountdownTimer } from './CountdownTimer';

interface FlashDealsProps {
  limit?: number;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ limit = 4 }) => {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [flashDealProducts, setFlashDealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFlashDeals();
  }, [limit]);

  const fetchFlashDeals = async () => {
    try {
      setIsLoading(true);
      const deals = await getActiveFlashDeals();
      setFlashDeals(deals);
      
      // Get products from the first active flash deal (or all deals)
      if (deals.length > 0) {
        // Fetch products from all active deals and combine them
        const allProducts = await Promise.all(
          deals.map(deal => getProductsForFlashDeal(deal.id))
        );
        
        // Flatten and deduplicate products by ID
        const uniqueProducts = Array.from(
          new Map(
            allProducts.flat().map(product => [product.id, product])
          ).values()
        );
        
        setFlashDealProducts(uniqueProducts.slice(0, limit));
      } else {
        setFlashDealProducts([]);
      }
    } catch (error) {
      console.error('Error fetching flash deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="text-white" size={28} />
              <div>
                <h2 className="text-xl font-bold text-white">Flash Deals</h2>
                <p className="text-white/90 text-xs">Loading deals...</p>
              </div>
            </div>
            <Link href="/deals">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white text-white"
                icon={<ArrowRight size={16} />}
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flashDeals.length === 0 || flashDealProducts.length === 0) {
    return null; // Don't show section if no active flash deals
  }

  return (
    <section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="text-white" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white">Flash Deals</h2>
              <p className="text-white/90 text-xs">Limited time offers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {flashDeals.length > 0 && (
              <CountdownTimer 
                endTime={flashDeals[0].end_time} 
                variant="default"
                className="text-white"
              />
            )}
            <Link href="/deals">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white text-white"
                icon={<ArrowRight size={16} />}
              >
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          {flashDealProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#3A3A3A] text-sm">No flash deals available at the moment</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flashDealProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant="error" size="sm">
                        {(product as any).flash_deal_discount || 0}% OFF
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

