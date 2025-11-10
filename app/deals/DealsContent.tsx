'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { motion } from 'framer-motion';
import { fadeIn, fadeInScale, fadeInUp, staggerChildren } from '@/lib/motion';

type DealDisplayProduct = Product & {
  deal_price: number;
  deal_discount: number;
};

const PLACEHOLDER_IMAGE = '/placeholders/placeholder-product.webp';

const parseAmount = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const computeDiscountPercentage = (originalPrice: number | null, discountedPrice: number | null): number => {
  if (!originalPrice || originalPrice <= 0 || discountedPrice === null || discountedPrice === undefined) {
    return 0;
  }
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return Math.max(0, discount);
};

const normalizeImages = (primary?: string | null, gallery?: string[] | null): string[] => {
  const images: string[] = [];
  if (Array.isArray(gallery)) {
    for (const image of gallery) {
      if (typeof image === 'string' && image.trim().length > 0) {
        images.push(image.trim());
      }
    }
  }
  if (typeof primary === 'string' && primary.trim().length > 0) {
    images.unshift(primary.trim());
  }
  const uniqueImages = Array.from(new Set(images));
  return uniqueImages.length > 0 ? uniqueImages : [PLACEHOLDER_IMAGE];
};

const parseKeyFeatures = (raw: string | string[] | null | undefined): string[] | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.filter((feature) => typeof feature === 'string' && feature.trim().length > 0);
  }
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0);
    }
  } catch {
    // Ignore JSON parsing errors and fallback below
  }

  return trimmed
    .replace(/\r/g, '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseSpecifications = (raw: unknown): Product['specifications'] => {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Product['specifications'];
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Product['specifications'];
      }
      return raw;
    } catch {
      return raw;
    }
  }
  return {};
};

export function DealsContent() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sectionMotionProps = useMemo(() => ({
    variants: fadeInUp,
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount: 0.2 },
  }), []);

  const gridVariants = useMemo(() => staggerChildren(0.08, 0.05), []);
  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  }), []);

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

  const buildDealProduct = (deal: Deal, dp: DealProduct): DealDisplayProduct | null => {
    const dealLevelDiscount = parseInteger(deal.discount_percentage) ?? 0;

      if (dp.product) {
      const product = dp.product as Product & Record<string, unknown>;
        const originalPrice =
          parseAmount((product as any).price) ??
          parseAmount(product.original_price) ??
          0;
      const discountPrice = parseAmount(product.discount_price);
      const explicitDealPrice = parseAmount(dp.deal_price);
      const overrideDiscount = parseInteger(dp.discount_percentage);
      const computedDealPrice =
        explicitDealPrice ??
        discountPrice ??
        (overrideDiscount && originalPrice
          ? Number((originalPrice * (1 - overrideDiscount / 100)).toFixed(2))
          : null) ??
        (dealLevelDiscount && originalPrice
          ? Number((originalPrice * (1 - dealLevelDiscount / 100)).toFixed(2))
          : null) ??
        originalPrice;

      const finalDealPrice = Number(
        (computedDealPrice ?? 0).toFixed(2)
      );
      const dealDiscount =
        overrideDiscount ??
        computeDiscountPercentage(originalPrice, finalDealPrice) ??
        dealLevelDiscount ??
        0;

      const stockOverride =
        dp.product_id
          ? null
          : parseInteger(dp.stock_quantity) ?? parseInteger(dp.original_stock);
      const stockQuantity =
        stockOverride ??
        parseInteger((product as any).stock_quantity) ??
        0;

      const images = normalizeImages(product.thumbnail, product.images as string[] | null | undefined);

      return {
          ...product,
        original_price: originalPrice,
        discount_price: finalDealPrice,
          stock_quantity: stockQuantity,
        in_stock: stockQuantity > 0 ? true : Boolean(product.in_stock),
        thumbnail: images[0],
        images,
        price_range: product.price_range ?? {
          min: finalDealPrice,
          max: originalPrice || finalDealPrice,
          hasRange: false,
        },
        deal_price: finalDealPrice,
          deal_discount: dealDiscount,
          base_product_id: product.id,
      };
      } 

    if (dp.product_name) {
      const originalPrice =
        parseAmount(dp.original_price) ?? 0;
      const explicitDealPrice = parseAmount(dp.deal_price);
      const overrideDiscount = parseInteger(dp.discount_percentage);
      const computedDealPrice =
        explicitDealPrice ??
        (overrideDiscount && originalPrice
          ? Number((originalPrice * (1 - overrideDiscount / 100)).toFixed(2))
          : null) ??
        (dealLevelDiscount && originalPrice
          ? Number((originalPrice * (1 - dealLevelDiscount / 100)).toFixed(2))
          : null) ??
        originalPrice;

      const finalDealPrice = Number(
        (computedDealPrice ?? 0).toFixed(2)
      );

      const dealDiscount =
        overrideDiscount ??
        computeDiscountPercentage(originalPrice, finalDealPrice) ??
        dealLevelDiscount ??
        0;

      const images = normalizeImages(dp.product_image_url, dp.product_images);
      const rawStock =
        parseInteger(dp.stock_quantity) ??
        parseInteger(dp.original_stock);
      const stockQuantity = rawStock ?? (finalDealPrice > 0 ? 999 : 0);
      const createdAt = dp.created_at || new Date().toISOString();

      const keyFeatures = parseKeyFeatures(dp.product_key_features);
      const specs = parseSpecifications(dp.product_specifications);

      const standaloneProduct: DealDisplayProduct = {
        id: dp.id,
          name: dp.product_name,
        slug: `deal-${dp.id}`,
          description: dp.product_description || '',
          key_features: keyFeatures,
        specifications: specs,
        category_id: (dp.product as Product | undefined)?.category_id || 'standalone',
        brand: (dp.product as Product | undefined)?.brand || 'VENTECH Deals',
        brand_id: (dp.product as Product | undefined)?.brand_id,
        original_price: originalPrice || finalDealPrice,
        discount_price: finalDealPrice,
        in_stock: stockQuantity > 0,
        stock_quantity: stockQuantity,
          images,
        thumbnail: images[0] || PLACEHOLDER_IMAGE,
          featured: false,
        rating: 0,
          review_count: 0,
        specs: (typeof specs === 'object' && !Array.isArray(specs) ? specs : {}) as Product['specs'],
          variants: [],
        created_at: createdAt,
        updated_at: createdAt,
        category_name: (dp.product as Product | undefined)?.category_name || null,
        category_slug: (dp.product as Product | undefined)?.category_slug || null,
        brand_name: (dp.product as Product | undefined)?.brand_name || 'VENTECH Deals',
        brand_slug: (dp.product as Product | undefined)?.brand_slug || null,
        base_product_id: dp.product_id || dp.id,
          price_range: {
          min: finalDealPrice,
          max: originalPrice || finalDealPrice,
            hasRange: false,
          },
        deal_price: finalDealPrice,
        deal_discount: dealDiscount,
      };

      return standaloneProduct;
    }

    return null;
  };

  const productsByDeal = deals
    .map((deal) => {
      const dealProductsForDeal = dealProducts.filter((dp) => dp.deal_id === deal.id);
      console.log(`Deal ${deal.id} (${deal.title}): ${dealProductsForDeal.length} deal products`);

      const products = dealProductsForDeal
        .map((dp) => buildDealProduct(deal, dp))
        .filter((product): product is DealDisplayProduct => product !== null);
    
    return {
      deal,
      products,
    };
    })
    .filter(({ products }) => products.length > 0);

  console.log('Products by deal:', productsByDeal);

  return (
    <motion.main
      className="min-h-screen bg-gray-50"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-16" variants={fadeInUp} custom={0.05}>
        <div className="container mx-auto px-4 text-center">
          <motion.div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6" variants={fadeInScale}>
            <Zap className="text-white" size={20} />
            <span className="text-sm font-semibold text-white">HOT DEALS</span>
          </motion.div>
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" variants={fadeInUp} custom={0.08}>
            Don&apos;t Miss Out on Amazing Deals!
          </motion.h1>
          <motion.p className="text-lg text-white/90 max-w-2xl mx-auto mb-8" variants={fadeInUp} custom={0.12}>
            Shop the latest discounts and exclusive offers on top gadgets and electronics
          </motion.p>
        </div>
      </motion.section>

      {/* Deals Campaigns Section */}
      {productsByDeal.length > 0 && (
        <motion.section className="container mx-auto px-4 py-12" variants={fadeInUp} custom={0.08}>
          {productsByDeal.map(({ deal, products }) => (
            <motion.div key={deal.id} className="mb-12" variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              {/* Campaign Header */}
              <motion.div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-xl p-6 md:p-8 mb-6" variants={fadeInScale}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <motion.div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4" variants={fadeInUp} custom={0.05}>
                      <Zap className="text-white" size={18} />
                      <span className="text-sm font-semibold text-white">DEAL</span>
                    </motion.div>
                    <motion.h2 className="text-2xl md:text-3xl font-bold text-white mb-2" variants={fadeInUp} custom={0.08}>
                      {deal.title}
                    </motion.h2>
                    {deal.description && (
                      <motion.p className="text-white/90 text-sm md:text-base mb-4" variants={fadeInUp} custom={0.1}>
                        {deal.description}
                      </motion.p>
                    )}
                    {deal.discount_percentage > 0 && (
                      <motion.div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2" variants={fadeInUp} custom={0.12}>
                        <Percent className="text-white" size={16} />
                        <span className="text-sm font-semibold text-white">
                          {deal.discount_percentage}% OFF
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <motion.div className="flex-shrink-0" variants={fadeInUp} custom={0.14}>
                    <div className="text-white mb-2 text-sm font-medium">Ends in:</div>
                    <CountdownTimer
                      endTime={deal.end_date}
                      variant="large"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Campaign Products */}
              {products.length > 0 ? (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={gridVariants}
                >
                  {products.map((product) => (
                    <motion.div key={product.id} className="relative" variants={cardVariants}>
                      <ProductCard product={product} />
                      {product.deal_discount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge variant="error" size="sm">
                            {product.deal_discount}% OFF
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div className="text-center py-12 bg-white rounded-xl" variants={fadeIn}>
                  <p className="text-[#3A3A3A]">No products in this deal yet</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.section>
      )}


      {/* Newsletter Section */}
      <motion.section className="container mx-auto px-4 py-12" {...sectionMotionProps}>
        <motion.div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-2xl p-8 md:p-12 text-center text-white" variants={fadeInScale}>
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
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
