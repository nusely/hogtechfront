import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export interface Deal {
  id: string;
  title: string;
  description?: string;
  banner_image_url?: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_flash_deal?: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DealProduct {
  id: string;
  deal_id: string;
  product_id?: string | null; // Nullable for standalone products
  deal_price?: number;
  discount_percentage: number;
  sort_order: number;
  is_flash_deal?: boolean;
  created_at: string;
  // Standalone product fields
  product_name?: string;
  product_description?: string;
  product_image_url?: string;
  product_images?: string[];
  product_key_features?: string | string[];
  product_specifications?: any;
  original_price?: number;
  product?: Product;
  deal?: Deal;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get all deals (public - active, admin - all)
export const getAllDeals = async (includeInactive: boolean = false): Promise<Deal[]> => {
  try {
    const url = `${API_URL}/api/deals${includeInactive ? '?includeInactive=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data || [];
      }
    }

    // Fallback to Supabase
    const now = new Date().toISOString();
    let query = supabase
      .from('deals')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

// Get deal by ID
export const getDealById = async (id: string): Promise<Deal | null> => {
  try {
    const response = await fetch(`${API_URL}/api/deals/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    }

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
};

// Get products for a deal
export const getDealProducts = async (dealId: string): Promise<DealProduct[]> => {
  try {
    const response = await fetch(`${API_URL}/api/deals/${dealId}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data || [];
      }
    }

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('deal_products')
      .select(`
        *,
        product:products(*)
      `)
      .eq('deal_id', dealId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase error fetching deal products:', error);
      throw error;
    }
    console.log('Deal products fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching deal products:', error);
    return [];
  }
};

// Get all products in active deals (for deals page)
export const getActiveDealProducts = async (): Promise<DealProduct[]> => {
  try {
    const response = await fetch(`${API_URL}/api/deals/active/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data || [];
      }
    }

    // Fallback to Supabase
    const now = new Date().toISOString();
    const { data: activeDeals, error: dealsError } = await supabase
      .from('deals')
      .select('id')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (dealsError) throw dealsError;

    if (!activeDeals || activeDeals.length === 0) {
      return [];
    }

    const dealIds = activeDeals.map(deal => deal.id);

    const { data: dealProducts, error: productsError } = await supabase
      .from('deal_products')
      .select(`
        *,
        product:products(*),
        deal:deals(id, title, discount_percentage, start_date, end_date)
      `)
      .in('deal_id', dealIds)
      .order('sort_order', { ascending: true });

    if (productsError) throw productsError;
    return dealProducts || [];
  } catch (error) {
    console.error('Error fetching active deal products:', error);
    return [];
  }
};

// Admin functions (require authentication)
export const createDeal = async (dealData: Partial<Deal>): Promise<Deal> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dealData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create deal');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to create deal');
  }

  return result.data;
};

export const updateDeal = async (id: string, updates: Partial<Deal>): Promise<Deal> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update deal');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to update deal');
  }

  return result.data;
};

export const deleteDeal = async (id: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete deal');
  }
};

export const addProductToDeal = async (dealId: string, productData: { 
  product_id?: string; 
  deal_price?: number; 
  discount_percentage?: number; 
  sort_order?: number; 
  is_flash_deal?: boolean;
  // Standalone product fields
  product_name?: string;
  product_description?: string;
  product_image_url?: string;
  product_images?: string[];
  product_key_features?: string;
  product_specifications?: any;
  original_price?: number;
}): Promise<DealProduct> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals/${dealId}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add product to deal');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to add product to deal');
  }

  return result.data;
};

export const updateDealProduct = async (dealId: string, productId: string, updates: Partial<DealProduct>): Promise<DealProduct> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals/${dealId}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update deal product');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to update deal product');
  }

  return result.data;
};

export const removeProductFromDeal = async (dealId: string, productId: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`${API_URL}/api/deals/${dealId}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove product from deal');
  }
};

// Get flash deal products (for homepage)
export const getFlashDealProducts = async (limit: number = 4): Promise<DealProduct[]> => {
  try {
    const response = await fetch(`${API_URL}/api/deals/flash/products?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('Flash deal products from API:', result.data);
        return result.data || [];
      }
    }

    console.warn('API call failed, falling back to Supabase');

    // Fallback to Supabase
    const now = new Date().toISOString();
    const { data: activeFlashDeals, error: dealsError } = await supabase
      .from('deals')
      .select('id')
      .eq('is_active', true)
      .eq('is_flash_deal', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (dealsError) throw dealsError;

    if (!activeFlashDeals || activeFlashDeals.length === 0) {
      console.log('No active flash deals found');
      return [];
    }

    const dealIds = activeFlashDeals.map(deal => deal.id);

    let query = supabase
      .from('deal_products')
      .select(`
        *,
        product:products(*),
        deal:deals(id, title, discount_percentage, start_date, end_date, is_flash_deal)
      `)
      .in('deal_id', dealIds)
      .eq('is_flash_deal', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    const { data: dealProducts, error: productsError } = await query;

    if (productsError) throw productsError;
    console.log('Flash deal products from Supabase:', dealProducts);
    return dealProducts || [];
  } catch (error) {
    console.error('Error fetching flash deal products:', error);
    return [];
  }
};

