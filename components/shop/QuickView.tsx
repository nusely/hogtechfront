'use client';

import React from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { Button } from '../ui/Button';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/helpers';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  const hasDiscount = product.discount_price && product.discount_price < product.original_price;
  const discountPercentage = hasDiscount
    ? calculateDiscountPercentage(product.original_price, product.discount_price!)
    : 0;

  return (
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
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          Out of Stock
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
                      disabled={!product.in_stock}
                      icon={<ShoppingCart size={20} />}
                    >
                      {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="md" className="w-full" icon={<Heart size={18} />}>
                        Wishlist
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
  );
};



