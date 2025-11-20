import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

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

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number | null;
  start_date: string;
  end_date?: string | null;
  usage_limit?: number | null;
  used_count: number;
  per_user_limit?: number | null;
  is_active: boolean;
  applicable_products?: string[] | null;
  applicable_categories?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponDto extends Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'> {
  // id, created_at, updated_at, used_count are generated/managed by backend
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// List all coupons
export const listCoupons = async (
  page: number = 1, 
  limit: number = 10, 
  search?: string, 
  status?: string
): Promise<PaginationResult<Coupon>> => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(buildApiUrl(`/api/coupons?${params.toString()}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch coupons');
    }

    // Map backend response structure
    // Backend returns { success: true, data: { coupons: [], pagination: {} } }
    return {
      data: result.data.coupons,
      pagination: result.data.pagination,
    };
  } catch (error: any) {
    console.error('Error listing coupons:', error);
    throw error;
  }
};

// Get single coupon
export const getCoupon = async (id: string): Promise<Coupon> => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(buildApiUrl(`/api/coupons/${id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch coupon');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error fetching coupon:', error);
    throw error;
  }
};

// Create coupon
export const createCoupon = async (couponData: CreateCouponDto): Promise<Coupon> => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(buildApiUrl('/api/coupons'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(couponData),
    });

    const result = await response.json();
    if (!response.ok) {
      // If validation errors, format them
      if (result.errors) {
        const errorMsg = Object.values(result.errors).flat().join(', ');
        throw new Error(errorMsg || 'Validation failed');
      }
      throw new Error(result.message || 'Failed to create coupon');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Update coupon
export const updateCoupon = async (id: string, updates: UpdateCouponDto): Promise<Coupon> => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(buildApiUrl(`/api/coupons/${id}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    if (!response.ok) {
      if (result.errors) {
        const errorMsg = Object.values(result.errors).flat().join(', ');
        throw new Error(errorMsg || 'Validation failed');
      }
      throw new Error(result.message || 'Failed to update coupon');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

// Delete coupon
export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(buildApiUrl(`/api/coupons/${id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete coupon');
    }
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

