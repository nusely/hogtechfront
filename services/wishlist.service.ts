import { supabase } from '@/lib/supabase';
import { Wishlist } from '@/types/product';

export const wishlistService = {
  // Get user's wishlist
  async getWishlist(userId: string): Promise<Wishlist[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // 42P01 = relation does not exist (table not created yet)
        const errorWithCode = error as any;
        if (errorWithCode.code === '42P01') {
          console.warn('Wishlist table does not exist yet. Please run create_wishlist_table.sql');
          return [];
        }
        throw error;
      }
      return (data || []).map((item: any) => ({
        ...item,
        product: normalizeWishlistProduct(item.product),
      }));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      // Check if already in wishlist
      const { data: existing, error: checkError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        const checkErrorWithCode = checkError as any;
        // PGRST116 = no rows found (not an error)
        if (checkErrorWithCode.code !== 'PGRST116') {
          console.error('Error checking wishlist:', {
            error: checkError,
            code: checkErrorWithCode.code,
            message: checkErrorWithCode.message,
            userId,
            productId,
          });
          throw checkError;
        }
      }

      if (existing) {
        return false; // Already in wishlist
      }

      const { error, data } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select();

      if (error) {
        const errorWithCode = error as any;
        // 42P01 = relation does not exist (table not created yet)
        if (errorWithCode.code === '42P01') {
          console.warn('Wishlist table does not exist yet. Please run create_wishlist_table.sql');
          return false;
        }
        // 23505 = unique_violation (already exists - race condition)
        if (errorWithCode.code === '23505') {
          console.warn('Product already in wishlist (race condition)');
          return false;
        }
        // PGRST301 = RLS policy violation
        if (errorWithCode.code === 'PGRST301' || errorWithCode.message?.includes('RLS') || errorWithCode.message?.includes('policy')) {
          console.error('RLS policy violation when adding to wishlist:', {
            code: errorWithCode.code,
            message: errorWithCode.message,
            details: errorWithCode.details,
            hint: errorWithCode.hint,
            userId,
            productId,
          });
          return false;
        }
        console.error('Error adding to wishlist:', {
          error,
          code: errorWithCode.code,
          message: errorWithCode.message,
          details: errorWithCode.details,
          hint: errorWithCode.hint,
          userId,
          productId,
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error adding to wishlist (catch block):', {
        error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        stack: error?.stack,
        userId,
        productId,
      });
      return false;
    }
  },

  // Remove product from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        // 42P01 = relation does not exist (table not created yet)
        if (error.code === '42P01') {
          console.warn('Wishlist table does not exist yet. Please run create_wishlist_table.sql');
          return false;
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  },

  // Check if product is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error) {
        const errorWithCode = error as any;
        // PGRST116 = no rows found (not an error, just not in wishlist)
        if (errorWithCode.code === 'PGRST116') {
          return false;
        }
        // 42P01 = relation does not exist (table not created yet)
        if (errorWithCode.code === '42P01') {
          console.warn('Wishlist table does not exist yet. Please run create_wishlist_table.sql');
          return false;
        }
        throw error;
      }
      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // Toggle wishlist (add if not present, remove if present)
  async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const isInWishlist = await this.isInWishlist(userId, productId);
      
      if (isInWishlist) {
        return await this.removeFromWishlist(userId, productId);
      } else {
        return await this.addToWishlist(userId, productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  },
};

const normalizeWishlistProduct = (product: any) => {
  if (!product) return product;

  const rawPrice = product.price ?? product.original_price ?? 0;
  const originalPrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string'
        ? parseFloat(rawPrice)
        : 0;

  const normalized = { ...product };
  normalized.original_price = Number.isFinite(originalPrice) ? originalPrice : 0;
  normalized.discount_price = null;
  normalized.price_range = {
    min: normalized.original_price,
    max: normalized.original_price,
    hasRange: false,
  };

  if (!normalized.thumbnail && normalized.images && normalized.images.length > 0) {
    normalized.thumbnail = normalized.images[0];
  }

  return normalized;
};
