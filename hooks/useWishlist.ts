import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setWishlistItems, addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { wishlistService } from '@/services/wishlist.service';

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items, count } = useAppSelector((state) => state.wishlist);

  // Load wishlist when user logs in
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated && user) {
        try {
          const wishlistItems = await wishlistService.getWishlist(user.id);
          const productIds = wishlistItems.map(item => item.product_id);
          dispatch(setWishlistItems(productIds));
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      } else {
        // Clear wishlist when user logs out
        dispatch(setWishlistItems([]));
      }
    };

    loadWishlist();
  }, [isAuthenticated, user, dispatch]);

  const addItem = async (productId: string) => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const success = await wishlistService.addToWishlist(user.id, productId);
      if (success) {
        dispatch(addToWishlist(productId));
      }
      return success;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeItem = async (productId: string) => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const success = await wishlistService.removeFromWishlist(user.id, productId);
      if (success) {
        dispatch(removeFromWishlist(productId));
      }
      return success;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const toggleItem = async (productId: string) => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const success = await wishlistService.toggleWishlist(user.id, productId);
      if (success) {
        // Refresh the entire wishlist to get accurate state
        const wishlistItems = await wishlistService.getWishlist(user.id);
        const productIds = wishlistItems.map(item => item.product_id);
        dispatch(setWishlistItems(productIds));
      }
      return success;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return items.includes(productId);
  };

  return {
    items,
    count,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
  };
};
