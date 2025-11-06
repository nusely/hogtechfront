import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

export interface FlashDeal {
  id: string;
  title: string;
  description?: string;
  banner_image_url?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashDealProduct {
  id: string;
  flash_deal_id: string;
  product_id: string;
  discount_percentage: number;
  flash_price?: number;
  sort_order: number;
  created_at: string;
  product?: Product;
}

// Fetch active flash deals
export const getActiveFlashDeals = async (): Promise<FlashDeal[]> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('flash_deals')
      .select('*')
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return [];
  }
};

// Fetch flash deal products
export const getFlashDealProducts = async (flashDealId?: string): Promise<FlashDealProduct[]> => {
  try {
    let query = supabase
      .from('flash_deal_products')
      .select(`
        *,
        product:products(*)
      `)
      .order('sort_order', { ascending: true });

    if (flashDealId) {
      query = query.eq('flash_deal_id', flashDealId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching flash deal products:', error);
    return [];
  }
};

// Fetch products that are currently in flash deals
export const getFlashDealProductsList = async (): Promise<Product[]> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!products_category_id_fkey(*),
        brand:brands!products_brand_id_fkey(*)
      `)
      .eq('is_flash_deal', true)
      .lte('flash_deal_start', now)
      .gte('flash_deal_end', now)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching flash deal products list:', error);
    return [];
  }
};

// Fetch products for a specific flash deal campaign
export const getProductsForFlashDeal = async (flashDealId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('flash_deal_products')
      .select(`
        *,
        product:products(
          *,
          category:categories!products_category_id_fkey(*),
          brand:brands!products_brand_id_fkey(*)
        )
      `)
      .eq('flash_deal_id', flashDealId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    
    // Extract products from the nested structure
    // Flatten nested brand and category objects to match Product type
    return data?.map((item: any) => {
      if (!item.product) return null;
      
      const product = item.product;
      return {
        ...product,
        // Extract brand name if brand is an object
        brand: typeof product.brand === 'object' && product.brand !== null 
          ? product.brand.name || product.brand_id 
          : product.brand || product.brand_id,
        // Extract category name if category is an object
        category_name: typeof product.category === 'object' && product.category !== null
          ? product.category.name
          : product.category_name || product.category_id,
        // Add flash deal specific fields
        flash_deal_discount: item.discount_percentage,
        flash_deal_price: item.flash_price,
      };
    }).filter((p: Product | null) => p !== null && p !== undefined) || [];
  } catch (error) {
    console.error('Error fetching products for flash deal:', error);
    return [];
  }
};

// Calculate time remaining for flash deal
export const getTimeRemaining = (endTime: string): { hours: number; minutes: number; seconds: number } => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

// Format time remaining as string (HH:MM:SS)
export const formatTimeRemaining = (endTime: string): string => {
  const { hours, minutes, seconds } = getTimeRemaining(endTime);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format time remaining with days if needed
export const formatTimeRemainingWithDays = (endTime: string): { days: number; hours: number; minutes: number; seconds: number; formatted: string } => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00:00' };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: days > 0 
      ? `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  };
};

// Admin functions - using backend API
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get auth token for API calls
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
  };
};

// Admin: Get all flash deals (including inactive)
export const getAllFlashDealsAdmin = async (includeInactive = false): Promise<FlashDeal[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${getApiUrl()}/api/flash-deals?includeInactive=${includeInactive}`,
      { headers }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch flash deals' }));
      throw new Error(errorData.message || 'Failed to fetch flash deals');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return [];
  }
};

// Admin: Create flash deal
export const createFlashDeal = async (dealData: {
  title: string;
  description?: string;
  banner_image_url?: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}): Promise<FlashDeal | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dealData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create flash deal' }));
      throw new Error(errorData.message || 'Failed to create flash deal');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error creating flash deal:', error);
    throw error;
  }
};

// Admin: Update flash deal
export const updateFlashDeal = async (id: string, dealData: Partial<FlashDeal>): Promise<FlashDeal | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dealData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update flash deal' }));
      throw new Error(errorData.message || 'Failed to update flash deal');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error updating flash deal:', error);
    throw error;
  }
};

// Admin: Delete flash deal
export const deleteFlashDeal = async (id: string): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete flash deal' }));
      throw new Error(errorData.message || 'Failed to delete flash deal');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting flash deal:', error);
    throw error;
  }
};

// Admin: Add product to flash deal
export const addProductToFlashDeal = async (
  flashDealId: string,
  productData: {
    product_id: string;
    discount_percentage: number;
    flash_price?: number;
    sort_order?: number;
  }
): Promise<FlashDealProduct | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals/${flashDealId}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add product to flash deal' }));
      throw new Error(errorData.message || 'Failed to add product to flash deal');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error adding product to flash deal:', error);
    throw error;
  }
};

// Admin: Remove product from flash deal
export const removeProductFromFlashDeal = async (flashDealId: string, productId: string): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals/${flashDealId}/products/${productId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to remove product from flash deal' }));
      throw new Error(errorData.message || 'Failed to remove product from flash deal');
    }

    return true;
  } catch (error: any) {
    console.error('Error removing product from flash deal:', error);
    throw error;
  }
};

// Admin: Update product in flash deal
export const updateFlashDealProduct = async (
  flashDealId: string,
  productId: string,
  productData: {
    discount_percentage?: number;
    flash_price?: number;
    sort_order?: number;
  }
): Promise<FlashDealProduct | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiUrl()}/api/flash-deals/${flashDealId}/products/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update flash deal product' }));
      throw new Error(errorData.message || 'Failed to update flash deal product');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error updating flash deal product:', error);
    throw error;
  }
};

// Get all product IDs that are currently in active flash deals
export const getProductsInFlashDeals = async (): Promise<Set<string>> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('flash_deal_products')
      .select('product_id, flash_deal:flash_deals!inner(id, is_active, start_time, end_time)')
      .eq('flash_deals.is_active', true)
      .lte('flash_deals.start_time', now)
      .gte('flash_deals.end_time', now);

    if (error) {
      // If the join fails, try a simpler query
      const { data: deals } = await supabase
        .from('flash_deals')
        .select('id')
        .eq('is_active', true)
        .lte('start_time', now)
        .gte('end_time', now);

      if (deals && deals.length > 0) {
        const dealIds = deals.map(d => d.id);
        const { data: flashProducts } = await supabase
          .from('flash_deal_products')
          .select('product_id')
          .in('flash_deal_id', dealIds);

        return new Set(flashProducts?.map((p: any) => p.product_id) || []);
      }
      return new Set();
    }

    return new Set(data?.map((item: any) => item.product_id) || []);
  } catch (error) {
    console.error('Error fetching products in flash deals:', error);
    return new Set();
  }
};
