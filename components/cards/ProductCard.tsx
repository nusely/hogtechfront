'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculateDiscountPercentage, getImageUrl } from '@/lib/helpers';
import { r2ImageLoader } from '@/lib/imageLoader';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { useWishlist } from '@/hooks/useWishlist';
import { LoginPromptModal } from '../auth/LoginPromptModal';
import toast from 'react-hot-toast';
import { useAllowBackorders } from '@/hooks/useAllowBackorders';
import { motion } from 'framer-motion';
import { fadeInScale, scaleHover } from '@/lib/motion';

interface ProductCardProps {
  product: Product;
  onQuickView?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isInWishlist, toggleItem, removeItem } = useWishlist();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { allowBackorders } = useAllowBackorders();
  
  const isInCart = items.some(item => item.id === product.id);
  const isWishlisted = isInWishlist(product.id);
  const stockQuantity = Number(product.stock_quantity ?? 0);
  const isBackorder = allowBackorders && (!product.in_stock || stockQuantity <= 0);
  const canPurchase = product.in_stock || isBackorder;

  // Check for deal price first (highest priority)
  const rawDealPrice = (product as any).deal_price;
  const rawDealDiscount = (product as any).deal_discount;

  const dealPrice = (() => {
    if (typeof rawDealPrice === 'number' && Number.isFinite(rawDealPrice)) {
      return rawDealPrice;
    }
    if (typeof rawDealPrice === 'string') {
      const parsed = parseFloat(rawDealPrice);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  })();

  const dealDiscount = (() => {
    if (typeof rawDealDiscount === 'number' && Number.isFinite(rawDealDiscount)) {
      return rawDealDiscount;
    }
    if (typeof rawDealDiscount === 'string') {
      const parsed = parseFloat(rawDealDiscount);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  })();
  
  // Calculate deal price if not explicitly set but discount is available
  let calculatedDealPrice: number | null = null;
  if (!dealPrice && dealDiscount && product.original_price) {
    calculatedDealPrice = Number(
      (product.original_price * (1 - dealDiscount / 100)).toFixed(2)
    );
  }
  
  // Use deal price if available, otherwise use regular discount price
  const finalPrice =
    (dealPrice ?? calculatedDealPrice ?? product.discount_price ?? product.original_price ?? 0);
  
  // Determine discount percentage
  const hasDeal = dealPrice !== null || calculatedDealPrice !== null;
  const hasDiscount = !hasDeal && product.discount_price && product.discount_price < product.original_price;
  const discountPercentage = hasDeal 
    ? dealDiscount || (product.original_price ? calculateDiscountPercentage(product.original_price, finalPrice) : 0)
    : hasDiscount
    ? calculateDiscountPercentage(product.original_price, product.discount_price!)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rawBaseProductId = (product as any).base_product_id;
    let resolvedBaseProductId: string | null = null;

    if (typeof rawBaseProductId === 'string' && rawBaseProductId.trim().length > 0) {
      resolvedBaseProductId = rawBaseProductId.trim();
    } else if (typeof product.id === 'string' && product.id.trim().length > 0) {
      resolvedBaseProductId = product.id.trim();
    }

    if (!resolvedBaseProductId) {
      toast.error('This promo item is not available for online checkout yet. Please contact support to order.');
      return;
    }

    if (!product.in_stock && !allowBackorders) {
      toast.error('This item is currently out of stock.');
      return;
    }

    // Use deal price if available, otherwise use regular discount/original price
    const itemPrice =
      (dealPrice ?? calculatedDealPrice ?? product.discount_price ?? product.original_price ?? 0);

    const cartItem = {
      ...product,
      quantity: 1,
      selected_variants: {},
      base_product_id: resolvedBaseProductId,
      // Override discount_price with deal price so cart uses the discounted price
      discount_price: hasDeal ? itemPrice : product.discount_price,
      original_price: product.original_price,
      subtotal: itemPrice,
      backorder: isBackorder,
    };

    dispatch(
      addToCart({
        product: cartItem,
        quantity: 1,
      })
    );

    if (isWishlisted) {
      const removed = await removeItem(product.id);
      if (!removed) {
        console.warn('Failed to remove item from wishlist after adding to cart');
      }
    }

    toast.success(
      `${product.name} added to cart${isBackorder ? ' (Backorder)' : ''}!`
    );
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const success = await toggleItem(product.id);
      if (success) {
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        toast.error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="wishlist"
      />
      <Link href={`/product/${product.slug}`}>
        <motion.div
          className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col"
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
          {...scaleHover}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              loader={r2ImageLoader}
              src={getImageUrl(product.thumbnail || '/placeholders/placeholder-product.webp')}
              alt={`${product.name}${product.brand ? ` by ${product.brand}` : ''} - Buy in Ghana`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="eager"
              unoptimized={product.thumbnail?.includes('files.hogtechgh.com') || product.thumbnail?.includes('.r2.dev')}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && discountPercentage > 0 && (
                <Badge variant="error" size="sm">
                  -{Math.round(discountPercentage)}%
                </Badge>
              )}
              {product.featured && (
                <Badge variant="warning" size="sm">
                  Featured
                </Badge>
              )}
              {!product.in_stock && (
                <Badge variant={isBackorder ? 'warning' : 'default'} size="sm">
                  {isBackorder ? 'Backorder' : 'Out of Stock'}
                </Badge>
              )}
            </div>

            {/* Rating - Fixed position on bottom left corner */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-[#1A1A1A]">{(product.rating || 0).toFixed(1)}</span>
            </div>

            {/* Cart Icon - Top right (opposite of rating), mobile only */}
            <div className="absolute top-3 right-3 z-10 md:hidden">
              <button
                onClick={handleAddToCart}
                disabled={!canPurchase}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-md ${
                  canPurchase
                    ? 'bg-[#00afef] text-white hover:bg-[#0099d6]'
                    : 'bg-gray-300 text-gray-100'
                }`}
                title={!product.in_stock ? 'Out of Stock' : isInCart ? 'In Cart' : 'Add to Cart'}
              >
                <ShoppingCart size={18} className="text-white" />
              </button>
            </div>

            {/* Action Buttons - Desktop: Show on hover, Mobile: Show wishlist only (no hover) */}
            {/* Desktop: Wishlist and Quick View on hover */}
            <div className="hidden md:flex absolute top-12 right-3 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={handleWishlist}
                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                title="Add to wishlist"
              >
                <Heart
                  size={16}
                  className={isWishlisted ? 'fill-[#00afef] text-[#00afef]' : 'text-[#3A3A3A]'}
                />
              </button>
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView();
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                  title="Quick view"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#3A3A3A]"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Mobile: Wishlist only (below cart icon, no circular background, just heart) */}
            <div className="md:hidden absolute top-14 right-3 z-10">
              <button
                onClick={handleWishlist}
                className="p-1"
                title="Add to wishlist"
              >
                <Heart
                  size={18}
                  className={isWishlisted ? 'fill-[#00afef] text-[#00afef]' : 'text-[#3A3A3A]'}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Brand/Category - Using p tag, smaller than product name */}
            <p className="text-[7px] sm:text-[9px] text-[#00afef] font-medium uppercase tracking-wide mb-1">
              {product.brand}
            </p>

            {/* Product Name - Using p tag for easier font-size control */}
            <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#00afef] transition-colors leading-tight">
              {product.name}
            </p>


            {/* Price - Using p tag, smaller size */}
            <div className="flex items-baseline gap-2 mb-3 mt-auto flex-wrap">
              {product.price_range?.hasRange ? (
                <span className="text-xs sm:text-sm text-[#00afef]">
                  {formatCurrency(product.price_range.min)} - {formatCurrency(product.price_range.max)}
                </span>
              ) : (
                <>
                  <span className="text-xs sm:text-sm text-[#00afef]">
                    {formatCurrency(finalPrice)}
                  </span>
                  {(hasDeal || hasDiscount) && product.original_price && (
                    <span className="text-[10px] sm:text-xs text-[#3A3A3A] line-through">
                      {formatCurrency(product.original_price)}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Desktop: Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!canPurchase}
              title={
                !product.in_stock
                  ? isBackorder
                    ? 'Available on backorder'
                    : 'Out of Stock'
                  : isInCart
                  ? 'In Cart'
                  : 'Add to Cart'
              }
              className={`hidden md:flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                canPurchase
                  ? 'bg-[#00afef] text-white hover:bg-[#0099d6]'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {!product.in_stock
                ? isBackorder
                  ? 'Backorder Item'
                  : 'Out of Stock'
                : isInCart
                ? 'In Cart'
                : 'Add to Cart'}
            </button>
          </div>
        </motion.div>
      </Link>
    </>
  );
};

