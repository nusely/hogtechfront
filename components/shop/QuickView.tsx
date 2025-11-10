'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { Button } from '../ui/Button';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/helpers';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { useWishlist } from '@/hooks/useWishlist';
import { LoginPromptModal } from '../auth/LoginPromptModal';
import toast from 'react-hot-toast';
import { useAllowBackorders } from '@/hooks/useAllowBackorders';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isInWishlist, toggleItem } = useWishlist();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<'wishlist' | 'cart' | 'general'>('general');
  const { allowBackorders } = useAllowBackorders();
  const stockQuantity = Number(product?.stock_quantity ?? 0);
  const isOutOfStock = !product?.in_stock || stockQuantity <= 0;
  const isBackorder = allowBackorders && isOutOfStock;
  const canPurchase = product?.in_stock || isBackorder;

  if (!product) return null;

  const hasDiscount = product.discount_price && product.discount_price < product.original_price;
  const discountPercentage = hasDiscount
    ? calculateDiscountPercentage(product.original_price, product.discount_price!)
    : 0;

  const isInCart = items.some(item => item.id === product.id);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock && !allowBackorders) {
      toast.error('This item is currently out of stock.');
      return;
    }

    dispatch(addToCart({
      product: {
        ...product,
        backorder: isBackorder,
      },
      quantity: 1,
    }));

    toast.success(
      `${product.name} added to cart${isBackorder ? ' (Backorder)' : ''}!`
    );
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      setLoginAction('wishlist');
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
        action={loginAction}
      />
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
                {/* Product Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={product.thumbnail || '/placeholders/placeholder-product.webp'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-[#FF7A19] text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discountPercentage}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="flex-1">
                    {/* Brand */}
                    <p className="text-sm text-[#FF7A19] font-semibold uppercase mb-2">
                      {product.brand}
                    </p>

                    {/* Name */}
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                      {product.name}
                    </h2>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#3A3A3A]">
                        {product.rating.toFixed(1)} ({product.review_count} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-bold text-[#1A1A1A]">
                        {formatCurrency(product.discount_price || product.original_price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(product.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#3A3A3A] leading-relaxed mb-6">
                      {product.description || 'No description available.'}
                    </p>

                    {/* Stock Status */}
                    <div className="mb-6">
                      {product.in_stock ? (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          In Stock
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                            isBackorder
                              ? 'text-[#FF7A19] bg-orange-50'
                              : 'text-red-600 bg-red-50'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isBackorder ? 'bg-[#FF7A19]' : 'bg-red-600'
                            }`}
                          ></span>
                          {isBackorder ? 'Available on Backorder' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={!canPurchase}
                      onClick={handleAddToCart}
                      icon={<ShoppingCart size={20} />}
                    >
                      {canPurchase
                        ? isInCart
                          ? 'In Cart'
                          : product.in_stock
                          ? 'Add to Cart'
                          : 'Backorder Item'
                        : 'Out of Stock'}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full"
                        onClick={handleWishlist}
                        icon={<Heart size={18} />}
                      >
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full"
                        onClick={() => {
                          onClose();
                          window.location.href = `/product/${product.slug}`;
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};



