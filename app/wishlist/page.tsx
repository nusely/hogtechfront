'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ChevronRight, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import { wishlistService } from '@/services/wishlist.service';
import { ProductCard } from '@/components/cards/ProductCard';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: any; // Using any to match ProductCard expectations
}

export default function WishlistPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const items = await wishlistService.getWishlist(user.id);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const success = await wishlistService.removeFromWishlist(user.id, productId);
      if (success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Please Login</h2>
            <p className="text-[#3A3A3A] mb-6">You need to be logged in to view your wishlist.</p>
            <Link
              href="/login"
              className="inline-block bg-[#FF7A19] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8C3A] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#3A3A3A] mb-6">
          <Link href="/" className="hover:text-[#FF7A19]">Home</Link>
          <ChevronRight size={16} />
          <span className="text-[#FF7A19]">Wishlist</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">My Wishlist</h1>
          <p className="text-[#3A3A3A]">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[#FF7A19]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Your Wishlist is Empty</h2>
            <p className="text-[#3A3A3A] mb-6 max-w-md mx-auto">
              Save products you love so you can easily find them later!
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#FF7A19] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8C3A] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Wishlist Items */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="relative group">
                <ProductCard 
                  product={item.product} 
                  onQuickView={() => {}} // No quick view needed in wishlist
                />
                {/* Remove from Wishlist Button - positioned over the card */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


