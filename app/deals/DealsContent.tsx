'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Zap, Clock, Percent } from 'lucide-react';
import { 
  getAllDeals,
  getActiveDealProducts,
  Deal,
  DealProduct
} from '@/services/deal.service';
import { CountdownTimer } from '@/components/shop/CountdownTimer';
import { Product } from '@/types/product';

type DealDisplayProduct = Product & {
  deal_price: number;
  deal_discount: number;
};

export function DealsContent() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        console.log('Fetching deals and products...');
        const [activeDeals, activeProducts] = await Promise.all([
          getAllDeals(false), // Get only active deals
          getActiveDealProducts(),
        ]);
        
        console.log('Deals fetched:', activeDeals);
        console.log('Deal products fetched:', activeProducts);
        
        setDeals(activeDeals);
        setDealProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching deals page data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Group products by deal - handle both existing products and standalone products
  const productsByDeal = deals.map(deal => {
    const dealProductsForDeal = dealProducts.filter(dp => dp.deal_id === deal.id);
    console.log(`Deal ${deal.id} (${deal.title}): ${dealProductsForDeal.length} deal products`);
    
    const products = dealProductsForDeal.reduce<DealDisplayProduct[]>((acc, dp) => {
      // Handle existing products (with product_id)
      if (dp.product) {
        const product = dp.product;
        // Calculate deal price
        let dealPrice = product.original_price || product.discount_price || 0;
        if (dp.deal_price) {
          dealPrice = dp.deal_price;
        } else if (dp.discount_percentage > 0 && product.original_price) {
          dealPrice = product.original_price * (1 - dp.discount_percentage / 100);
        } else if (deal.discount_percentage > 0 && product.original_price) {
          dealPrice = product.original_price * (1 - deal.discount_percentage / 100);
        }
        
        const dealDiscount = dp.discount_percentage || deal.discount_percentage || 0;

        acc.push({
          ...product,
          deal_price: dealPrice,
          deal_discount: dealDiscount,
        });
      } 
      // Handle standalone products (without product_id)
      else if (dp.product_name) {
        // Calculate deal price for standalone products
        let dealPrice = dp.original_price || 0;
        if (dp.deal_price) {
          dealPrice = dp.deal_price;
        } else if (dp.discount_percentage > 0 && dp.original_price) {
          dealPrice = dp.original_price * (1 - dp.discount_percentage / 100);
        } else if (deal.discount_percentage > 0 && dp.original_price) {
          dealPrice = dp.original_price * (1 - deal.discount_percentage / 100);
        }
        
        const dealDiscount = dp.discount_percentage || deal.discount_percentage || 0;
        const images = dp.product_images && dp.product_images.length > 0
          ? dp.product_images
          : dp.product_image_url
            ? [dp.product_image_url]
            : ['/placeholders/placeholder-product.webp'];

        const keyFeatures = (() => {
          const raw = dp.product_key_features;
          if (Array.isArray(raw)) {
            return raw;
          }
          if (typeof raw === 'string') {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                return parsed;
              }
              // Fallback: split by newline or commas after removing quotes
              return raw
                .replace(/\r/g, '')
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean);
            } catch (error) {
              return raw
                .replace(/\r/g, '')
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean);
            }
          }
          return [];
        })();

        let parsedSpecifications: unknown = dp.product_specifications;
        if (typeof parsedSpecifications === 'string') {
          try {
            parsedSpecifications = JSON.parse(parsedSpecifications);
          } catch (error) {
            console.warn('Failed to parse product specifications for deal product:', dp.id, error);
          }
        }
        let specificationValue: Product['specifications'] = {};
        let specsObject: Product['specs'] = {};
        if (typeof parsedSpecifications === 'string') {
          specificationValue = parsedSpecifications;
        } else if (parsedSpecifications && typeof parsedSpecifications === 'object' && !Array.isArray(parsedSpecifications)) {
          specificationValue = parsedSpecifications;
          specsObject = parsedSpecifications as Product['specs'];
        }

        const timestamps = dp.created_at || new Date().toISOString();

        const standaloneProduct: Product = {
          id: dp.id, // Use deal_product id as product id
          name: dp.product_name,
          slug: `deal-${dp.id}`, // Generate a slug for standalone products
          description: dp.product_description || '',
          key_features: keyFeatures,
          specifications: specificationValue,
          category_id: 'standalone',
          brand: 'VENTECH Deals',
          brand_id: undefined,
          original_price: dp.original_price || dealPrice,
          discount_price: null,
          in_stock: true,
          stock_quantity: 0,
          images,
          thumbnail: images[0] || '/placeholders/placeholder-product.webp',
          featured: false,
          rating: 0, // Default rating for standalone products
          review_count: 0,
          specs: specsObject,
          variants: [],
          created_at: timestamps,
          updated_at: timestamps,
          category_name: null,
          category_slug: null,
          brand_name: 'VENTECH Deals',
          brand_slug: null,
          price_range: {
            min: dealPrice || 0,
            max: dp.original_price || dealPrice || 0,
            hasRange: false,
          },
        };

        acc.push({
          ...standaloneProduct,
          deal_price: dealPrice,
          deal_discount: dealDiscount,
        });
      }
      return acc;
    }, []);
    
    return {
      deal,
      products,
    };
  }).filter(({ products }) => products.length > 0);

  console.log('Products by deal:', productsByDeal);

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

      {/* Deals Campaigns Section */}
      {productsByDeal.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          {productsByDeal.map(({ deal, products }) => (
            <div key={deal.id} className="mb-12">
              {/* Campaign Header */}
              <div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-xl p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Zap className="text-white" size={18} />
                      <span className="text-sm font-semibold text-white">DEAL</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {deal.title}
                    </h2>
                    {deal.description && (
                      <p className="text-white/90 text-sm md:text-base mb-4">
                        {deal.description}
                      </p>
                    )}
                    {deal.discount_percentage > 0 && (
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <Percent className="text-white" size={16} />
                        <span className="text-sm font-semibold text-white">
                          {deal.discount_percentage}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-white mb-2 text-sm font-medium">Ends in:</div>
                    <CountdownTimer 
                      endTime={deal.end_date} 
                      variant="large"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Products */}
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} />
                      {product.deal_discount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge variant="error" size="sm">
                            {product.deal_discount}% OFF
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
              suppressHydrationWarning
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
