'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/helpers';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { useWishlist } from '@/hooks/useWishlist';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { isInWishlist, toggleItem } = useWishlist();
  
  const isInCart = items.some(item => item.id === product.id);
  const isWishlisted = isInWishlist(product.id);

  const hasDiscount = product.discount_price && product.discount_price < product.original_price;
  const discountPercentage = hasDiscount
    ? calculateDiscountPercentage(product.original_price, product.discount_price!)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem = {
      ...product,
      quantity: 1,
      selected_variants: {},
      subtotal: product.discount_price || product.original_price,
    };

    dispatch(
      addToCart({
        product: cartItem,
        quantity: 1,
      })
    );

    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    <Link href={`/product/${product.slug}`}>
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.thumbnail || '/placeholders/placeholder-product.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="eager"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="error" size="sm">
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.featured && (
              <Badge variant="warning" size="sm">
                Featured
              </Badge>
            )}
            {!product.in_stock && (
              <Badge variant="default" size="sm">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Rating - Fixed position on left corner */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className="p-2 bg-white rounded-full shadow-md hover:bg-orange-50 transition-colors"
              title="Add to wishlist"
            >
              <Heart
                size={16}
                className={isWishlisted ? 'fill-[#FF7A19] text-[#FF7A19]' : 'text-[#3A3A3A]'}
              />
            </button>
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView();
                }}
                className="p-2 bg-white rounded-full shadow-md hover:bg-orange-50 transition-colors"
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
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Brand/Category */}
          <p className="text-xs text-[#FF7A19] font-medium uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Product Name - Reduced font size by 15% */}
          <h3 className="text-xs font-semibold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#FF7A19] transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>


          {/* Price - Reduced font size by 15% */}
          <div className="flex items-baseline gap-2 mb-3 mt-auto">
            <span className="text-sm font-bold text-[#1A1A1A]">
              {formatCurrency(product.discount_price || product.original_price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#3A3A3A] line-through">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Improved height and hover effects */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            variant="primary"
            size="md"
            icon={!isInCart ? <ShoppingCart size={16} /> : undefined}
            className="w-full text-sm whitespace-nowrap h-10 hover:scale-105 transition-transform duration-200 hover:shadow-lg"
          >
            {!product.in_stock ? 'Out of Stock' : isInCart ? 'Added to Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

