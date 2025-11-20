'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { HeroSlider } from '@/components/banners/HeroSlider';
import { ProductCard } from '@/components/cards/ProductCard';
import { ProductListSkeleton } from '@/components/loaders/ProductCardSkeleton';
import { QuickView } from '@/components/shop/QuickView';
import { FlashDeals } from '@/components/shop/FlashDeals';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  ShoppingBag,
  Shield,
  Headphones,
  Zap,
  Award,
  Tag,
  TrendingUp,
  Star
} from 'lucide-react';
import { Product, Category } from '@/types/product';
import { Banner } from '@/types/banner';
import { productService } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { supabasePublic } from '@/lib/supabase';
import { CategoryCarousel } from '@/components/categories/CategoryCarousel';
import { seoConfig } from '@/lib/seo.config';
import { buildApiUrl } from '@/lib/api';
import { motion } from 'framer-motion';
import { fadeIn, fadeInScale, fadeInUp, staggerChildren } from '@/lib/motion';
import HedgehogLoader from '@/components/loaders/HedgehogLoader';

export function HomeContent() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const sectionMotionProps = {
    variants: fadeInUp,
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount: 0.2 },
  } as const;

  // Fetch banners separately to allow refresh
  const fetchBanners = useCallback(async () => {
    try {
      // Try backend API first (bypasses RLS) - use public endpoint /api/banners/hero
      try {
        const response = await fetch(buildApiUrl('/api/banners/hero'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Map to expected format (already filtered by type 'hero' from backend)
            const heroBanners = (result.data || [])
              .filter((b: any) => b && b.active !== false)
              .map((b: any) => ({
                id: b.id || '',
                title: b.title || '',
                subtitle: b.subtitle || undefined,
                description: b.description || undefined,
                image_url: b.image_url || '',
                link_url: b.link_url || b.link || undefined,
                link_text: b.button_text || b.link_text || undefined,
                display_order: b.order || b.sort_order || b.display_order || b.position || 0,
                active: b.active !== false,
                type: (b.type || 'hero') as 'hero',
                position: b.order || b.sort_order || b.display_order || b.position || 0,
                text_color: b.text_color || '#FFFFFF',
                created_at: b.created_at || new Date().toISOString(),
                updated_at: b.updated_at || new Date().toISOString(),
              }))
              .sort((a: any, b: any) => a.display_order - b.display_order);
            
            return heroBanners as Banner[];
          }
        } else {
          // Log non-OK responses for debugging
          const errorText = await response.text().catch(() => 'Unable to read error');
          console.warn(`Backend API returned ${response.status}: ${errorText}`);
        }
      } catch (apiError: any) {
        console.warn('Backend API failed, trying Supabase:', {
          message: apiError?.message || 'Unknown error',
          error: apiError,
        });
      }

      // Fallback to Supabase (may have RLS restrictions)
      const { data: bannersData, error } = await supabasePublic
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true })
        .limit(10);
      
      if (error) {
        // Improved error logging
        const errorCode = (error as any)?.code || (error as any)?.status;
        const errorMessage = (error as any)?.message || 'Unknown error';
        
        // Only log if it's not a common "expected" error
        if (errorCode !== '401' && errorCode !== 'PGRST301' && errorCode !== 'PGRST116' && errorCode !== 401 && errorCode !== 404) {
          console.error('Error fetching banners from Supabase:', {
            error: error,
            message: errorMessage,
            code: errorCode,
            status: (error as any)?.status,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            errorString: error?.toString(),
            errorJson: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'No error object',
          });
        }
        return [];
      }
      
      if (bannersData && Array.isArray(bannersData)) {
        // Filter for hero type banners (if type field exists) and map to expected format
        const heroBanners = bannersData
          .filter((b: any) => b && b.active !== false && (!b.type || b.type === 'hero'))
          .map((b: any) => ({
            id: b.id || '',
            title: b.title || '',
            subtitle: b.subtitle || undefined,
            description: b.description || undefined,
            image_url: b.image_url || '',
            link_url: b.link_url || b.link || undefined,
            link_text: b.button_text || b.link_text || undefined,
            display_order: b.order || b.sort_order || b.display_order || 0,
            active: b.active !== false,
            type: (b.type || 'hero') as 'hero',
            position: b.order || b.sort_order || b.display_order || 0,
            text_color: b.text_color || '#FFFFFF',
            created_at: b.created_at || new Date().toISOString(),
            updated_at: b.updated_at || new Date().toISOString(),
          }))
          .sort((a: any, b: any) => a.display_order - b.display_order);
        
        return heroBanners as Banner[];
      }
      
      return [];
    } catch (error) {
      // Improved error logging
      console.error('Error fetching banners:', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorString: error?.toString(),
        errorJson: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'No error object',
      });
      return [];
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ featured: false, limit: 20 }),
          getCategories(),
        ]);

        // Get featured products separately - only products explicitly marked as featured
        const featuredData = await productService.getProducts({ featured: true, limit: 10 });
        // Filter to ensure only products with featured=true are included
        const actualFeaturedProducts = featuredData.filter(p => p.featured === true);
        setFeaturedProducts(actualFeaturedProducts);

        // Filter out featured products from all products - exclude products that are featured
        const featuredProductIds = new Set(actualFeaturedProducts.map(p => p.id));
        const nonFeaturedProducts = productsData.filter(p => !p.featured && !featuredProductIds.has(p.id));
        setAllProducts(nonFeaturedProducts);

        // Set categories (main categories only for homepage)
        // Don't slice here - let CategoryCarousel handle the display limit
        const mainCategories = categoriesData.filter(cat => !cat.parent_id);
        setCategories(mainCategories);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up interval to refresh banners every 30 seconds (for admin updates)
    const bannerRefreshInterval = setInterval(() => {
      fetchBanners();
    }, 30000);
    
    return () => {
      clearInterval(bannerRefreshInterval);
    };
  }, [fetchBanners]);

  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetchBanners().then(banners => banners && setHeroBanners(banners));
  }, [fetchBanners]);

  return (
    <motion.main className="bg-white overflow-x-hidden" variants={fadeIn} initial="hidden" animate="visible">
      {/* Hero Section */}
      <motion.section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6" variants={fadeInUp} initial="hidden" animate="visible">
        <HeroSlider banners={heroBanners} />
      </motion.section>

      {/* Features Section */}
      <motion.section className="bg-gray-50 py-6 sm:py-8 border-y border-gray-200" {...sectionMotionProps}>
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4" variants={staggerChildren(0.08)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            {/* Momo & Cards - First on mobile */}
            <motion.div className="flex flex-col items-center text-center p-4" variants={fadeInUp}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="text-[#00afef]" size={18} />
              </div>
              <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Momo & Cards</p>
            </motion.div>
            {/* Quality Guarantee */}
            <motion.div className="flex flex-col items-center text-center p-4" variants={fadeInUp} custom={0.05}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Award className="text-[#00afef]" size={18} />
              </div>
              <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Quality Guarantee</p>
            </motion.div>
            {/* 24/7 Support */}
            <motion.div className="flex flex-col items-center text-center p-4" variants={fadeInUp} custom={0.1}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Headphones className="text-[#00afef]" size={18} />
              </div>
              <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">24/7 Support</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10" {...sectionMotionProps}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="text-[#00afef]" size={20} />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A]">Featured Products</h2>
            </div>
            <p className="text-[#3A3A3A] text-[11px] sm:text-xs">Top-rated and trending items</p>
          </div>
          <Link href="/shop?featured=true" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={<ArrowRight size={14} />} className="w-full sm:w-auto">
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <ProductListSkeleton count={5} />
        ) : featuredProducts.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
            variants={staggerChildren(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {featuredProducts.slice(0, 10).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Star className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-[#3A3A3A] mb-4">No featured products yet</p>
            <Link href="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        )}
      </motion.section>

      {/* Categories */}
      <motion.section className="bg-gray-50 py-6 sm:py-10" {...sectionMotionProps}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1">Shop by Category</h2>
              <p className="text-[#3A3A3A] text-[11px] sm:text-xs">Browse our product categories</p>
            </div>
            <Link href="/categories" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" icon={<ArrowRight size={14} />} className="w-full sm:w-auto">
                View All Categories
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <CategoryCarousel categories={categories} />
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Tag className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-[#3A3A3A] mb-4">No categories yet</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Flash Deals */}
      <motion.section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10" {...sectionMotionProps}>
        <FlashDeals />
      </motion.section>

      {/* All Products / Trending */}
      <motion.section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10" {...sectionMotionProps}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-[#00afef]" size={20} />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A]">All Products</h2>
              </div>
              <p className="text-[#3A3A3A] text-[11px] sm:text-xs">Explore our complete collection</p>
            </div>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" icon={<ArrowRight size={14} />} className="w-full sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

        {isLoading ? (
          <ProductListSkeleton count={20} />
        ) : allProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-[#3A3A3A] text-sm mb-4">No products available yet</p>
            <Link href="/shop">
              <Button variant="outline">Browse Categories</Button>
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
            variants={staggerChildren(0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {allProducts.slice(0, 20).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Special Offers Banner */}
      <motion.section className="container mx-auto px-4 py-10" {...sectionMotionProps}>
        <motion.div className="relative rounded-2xl overflow-hidden text-white" variants={fadeInScale}>
          <div className="absolute inset-0 bg-[url('/placeholders/bg-gadgets1.webp')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-2xl p-8 md:p-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00afef] to-[#163b86] rounded-full px-4 py-1 mb-4">
              <Tag size={14} />
              <span className="text-xs font-semibold">SPECIAL OFFER</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Get Up to 50% OFF on Selected Items
            </h2>
            <p className="text-white/90 text-sm mb-6">
              Don't miss out on our biggest sale of the season. Limited time only!
            </p>
            <Link href="/deals">
              <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10">
            <ShoppingBag size={200} />
          </div>
        </motion.div>
      </motion.section>

      {/* Stay Updated / Newsletter Section */}
      <motion.section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10" {...sectionMotionProps}>
        <motion.div className="bg-gradient-to-r from-[#00afef] via-[#0d7bc4] to-[#163b86] rounded-2xl p-6 md:p-12 text-center text-white" variants={fadeInScale}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive deals, flash sales, and special offers!
          </p>
          <form className="max-w-md mx-auto flex flex-col gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg text-[#1A1A1A] border border-white focus:outline-none focus:ring-2 focus:ring-white"
              suppressHydrationWarning
            />
            <Button variant="secondary" size="lg" type="submit" className="w-full sm:w-auto sm:mx-auto">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </motion.section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-[#163b86] to-[#1a4ba0] py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white !text-white">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-base text-white mb-6 !text-white">
            Explore our collection of the latest gadgets and electronics
          </p>
          <Link href="/categories">
            <Button variant="primary" size="lg" icon={<ShoppingBag size={18} />}>
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </motion.main>
  );
}


