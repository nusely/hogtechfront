import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

// Get similar products based on category only
// Similar products must be from the same category
export const getSimilarProducts = async (
  productId: string, 
  categoryId: string, 
  brandId: string, // Keep for backward compatibility but not used
  limit: number = 4
): Promise<Product[]> => {
  try {
    // Only fetch products from the same category
    if (!categoryId) {
      console.warn('No category ID provided, cannot fetch similar products');
      return [];
    }

    const { data: sameCategoryProducts, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .neq('id', productId)
      .eq('in_stock', true)
          .limit(limit);

    if (error) {
      console.warn('Error fetching same category products:', error.message);
      return [];
        }

    return sameCategoryProducts || [];
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    return [];
  }
};

// Get related products based on tags or keywords (if you have a tags system)
export const getRelatedProducts = async (
  productId: string,
  tags: string[],
  limit: number = 4
): Promise<Product[]> => {
  try {
    // This is a placeholder for tag-based recommendations
    // You would need to implement a tags system in your database
    // For now, we'll use the category-based approach
    return [];
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
};

// Get recently viewed products (if you implement a view tracking system)
export const getRecentlyViewedProducts = async (
  userId: string,
  limit: number = 4
): Promise<Product[]> => {
  try {
    // This would require a product_views table to track user viewing history
    // For now, we'll return an empty array
    return [];
  } catch (error) {
    console.error('Failed to fetch recently viewed products:', error);
    return [];
  }
};

// Export as object for convenience
export const similarProductsService = {
  getSimilarProducts,
  getRelatedProducts,
  getRecentlyViewedProducts,
};
