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
    const { data, error } = await supabase
      .from('flash_deals')
      .select('*')
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .lte('start_time', new Date().toISOString())
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
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!products_category_id_fkey(*),
        brand:brands!products_brand_id_fkey(*)
      `)
      .eq('is_flash_deal', true)
      .gte('flash_deal_end', new Date().toISOString())
      .lte('flash_deal_start', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching flash deal products list:', error);
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

// Format time remaining as string
export const formatTimeRemaining = (endTime: string): string => {
  const { hours, minutes, seconds } = getTimeRemaining(endTime);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
