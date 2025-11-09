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
        category_id: dp.product?.category_id || 'standalone',
        brand: dp.product?.brand || 'VENTECH Deals',
        brand_id: dp.product?.brand_id,
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
        category_name: dp.product?.category_name || null,
        category_slug: dp.product?.category_slug || null,
        brand_name: dp.product?.brand_name || 'VENTECH Deals',
        brand_slug: dp.product?.brand_slug || null,
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
