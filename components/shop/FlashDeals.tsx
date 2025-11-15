'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Clock, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { getFlashDealProducts, DealProduct } from '@/services/deal.service';
import { CountdownTimer } from './CountdownTimer';

interface FlashDealsProps {
  limit?: number;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ limit = 4 }) => {
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDeals();
  }, [limit]);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const products = await getFlashDealProducts(limit);
      console.log('Flash deal products fetched:', products);
      
      // Get unique products (deduplicate by product ID or deal_product ID for standalone products)
      const uniqueProducts = Array.from(
        new Map(
          products.map(dp => [dp.product_id || dp.id, dp])
        ).values()
      );
      
      console.log('Unique flash deal products:', uniqueProducts);
      setDealProducts(uniqueProducts.slice(0, limit));
    } catch (error) {
      console.error('Error fetching flash deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const maxIndex = Math.min(dealProducts.length - 1, 3); // Max 4 products (0-3)
      const newIndex = Math.min(maxIndex, currentIndex + 1);
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-r from-[#00afef] via-[#0d7bc4] to-[#163b86] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="text-white" size={28} />
              <div>
                <h2 className="text-xl font-bold text-white">Deals</h2>
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

  if (dealProducts.length === 0) {
    return null; // Don't show section if no active deals
  }

  // Get the first deal for countdown timer
  const firstDeal = dealProducts[0]?.deal;

  return (
    <section className="bg-gradient-to-r from-[#00afef] via-[#0d7bc4] to-[#163b86] py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="text-white" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white">Deals</h2>
              <p className="text-white/90 text-xs">Limited time offers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {firstDeal && (
              <CountdownTimer 
                endTime={firstDeal.end_date} 
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
          {dealProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#3A3A3A] text-sm">No flash deals available at the moment</p>
            </div>
          ) : (
            <>
              {/* Desktop: Grid layout (max 4) */}
              <div className="hidden md:grid md:grid-cols-4 gap-4">
                {dealProducts.map((dealProduct) => {
                  // Handle both existing products and standalone products
                  let product: any = null;
                  
                  if (dealProduct.product) {
                    // Existing product
                    const rawQuantity = Number(dealProduct.product.stock_quantity ?? 0);
                    const stockQuantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
                    product = {
                      ...dealProduct.product,
                      stock_quantity: stockQuantity,
                      in_stock: stockQuantity > 0,
                      base_product_id: dealProduct.product.id,
                    };
                  } else if (dealProduct.product_name) {
                    // Standalone product
                    product = {
                      id: dealProduct.id,
                      name: dealProduct.product_name,
                      description: dealProduct.product_description || '',
                      thumbnail: dealProduct.product_image_url || (dealProduct.product_images && dealProduct.product_images[0]) || '',
                      images: dealProduct.product_images || (dealProduct.product_image_url ? [dealProduct.product_image_url] : []),
                      original_price: dealProduct.original_price || 0,
                      discount_price: 0,
                      slug: `deal-${dealProduct.id}`,
                      category_id: null,
                      brand_id: null,
                      sku: `DEAL-${dealProduct.id}`,
                      stock_quantity: 0,
                      in_stock: Boolean(dealProduct.product_id),
                      is_featured: false,
                      key_features: dealProduct.product_key_features || [],
                      specifications: dealProduct.product_specifications || {},
                      rating: 0,
                      base_product_id: dealProduct.product_id || null,
                    };
                  }
                  
                  if (!product) return null;
                  
                  const deal = dealProduct.deal;
                  
                  // Calculate deal price
                  let dealPrice = product.original_price || product.discount_price || 0;
                  if (dealProduct.deal_price) {
                    dealPrice = dealProduct.deal_price;
                  } else if (dealProduct.discount_percentage > 0 && product.original_price) {
                    dealPrice = product.original_price * (1 - dealProduct.discount_percentage / 100);
                  } else if (deal?.discount_percentage && deal.discount_percentage > 0 && product.original_price) {
                    dealPrice = product.original_price * (1 - deal.discount_percentage / 100);
                  }
                  
                  const discount = dealProduct.discount_percentage || deal?.discount_percentage || 0;
                  
                  return (
                    <div key={dealProduct.id} className="relative">
                      <ProductCard product={{
                        ...product,
                        deal_price: dealPrice,
                        deal_discount: discount,
                      }} />
                      {discount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge variant="error" size="sm">
                            {discount}% OFF
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Carousel layout (one product per viewport, max 4) */}
              <div className="md:hidden relative">
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {dealProducts.slice(0, 4).map((dealProduct, index) => {
                    // Handle both existing products and standalone products
                    let product: any = null;
                    
                    if (dealProduct.product) {
                      // Existing product
                      const rawQuantity = Number(dealProduct.product.stock_quantity ?? 0);
                      const stockQuantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
                      product = {
                        ...dealProduct.product,
                        stock_quantity: stockQuantity,
                        in_stock: stockQuantity > 0,
                        base_product_id: dealProduct.product.id,
                      };
                    } else if (dealProduct.product_name) {
                      // Standalone product
                      product = {
                        id: dealProduct.id,
                        name: dealProduct.product_name,
                        description: dealProduct.product_description || '',
                        thumbnail: dealProduct.product_image_url || (dealProduct.product_images && dealProduct.product_images[0]) || '',
                        images: dealProduct.product_images || (dealProduct.product_image_url ? [dealProduct.product_image_url] : []),
                        original_price: dealProduct.original_price || 0,
                        discount_price: 0,
                        slug: `deal-${dealProduct.id}`,
                        category_id: null,
                        brand_id: null,
                        sku: `DEAL-${dealProduct.id}`,
                        stock_quantity: 0,
                        in_stock: Boolean(dealProduct.product_id),
                        is_featured: false,
                        key_features: dealProduct.product_key_features || [],
                        specifications: dealProduct.product_specifications || {},
                        rating: 0,
                        base_product_id: dealProduct.product_id || null,
                      };
                    }
                    
                    if (!product) return null;
                    
                    const deal = dealProduct.deal;
                    
                    // Calculate deal price
                    let dealPrice = product.original_price || product.discount_price || 0;
                    if (dealProduct.deal_price) {
                      dealPrice = dealProduct.deal_price;
                    } else if (dealProduct.discount_percentage > 0 && product.original_price) {
                      dealPrice = product.original_price * (1 - dealProduct.discount_percentage / 100);
                    } else if (deal?.discount_percentage && deal.discount_percentage > 0 && product.original_price) {
                      dealPrice = product.original_price * (1 - deal.discount_percentage / 100);
                    }
                    
                    const discount = dealProduct.discount_percentage || deal?.discount_percentage || 0;
                    
                    return (
                      <div 
                        key={dealProduct.id} 
                        className="relative flex-shrink-0 w-full snap-center"
                      >
                        <ProductCard product={{
                          ...product,
                          deal_price: dealPrice,
                          deal_discount: discount,
                        }} />
                        {discount > 0 && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <Badge variant="error" size="sm">
                              {discount}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Carousel Navigation */}
                {dealProducts.slice(0, 4).length > 1 && (
                  <>
                    <button
                      onClick={scrollLeft}
                      disabled={currentIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      aria-label="Previous product"
                    >
                      <ChevronLeft size={20} className="text-[#00afef]" />
                    </button>
                    <button
                      onClick={scrollRight}
                      disabled={currentIndex >= Math.min(dealProducts.length - 1, 3)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      aria-label="Next product"
                    >
                      <ChevronRight size={20} className="text-[#00afef]" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                      {dealProducts.slice(0, 4).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index);
                            if (scrollContainerRef.current) {
                              const cardWidth = scrollContainerRef.current.offsetWidth;
                              scrollContainerRef.current.scrollTo({
                                left: index * cardWidth,
                                behavior: 'smooth',
                              });
                            }
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentIndex ? 'bg-[#00afef] w-6' : 'bg-gray-300'
                          }`}
                          aria-label={`Go to product ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
