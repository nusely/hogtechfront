import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

export interface DiscountApplyPayload {
  code: string;
  subtotal: number;
  deliveryFee: number;
  items: Array<{
    product_id?: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export interface DiscountApplyResult {
  discountId: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  appliesTo: 'all' | 'products' | 'shipping' | 'total';
  discountAmount: number;
  adjustedDeliveryFee: number;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : {};
};

export interface Discount {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_amount: number;
  maximum_discount?: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  usage_limit?: number;
  used_count: number;
  applies_to: 'all' | 'products' | 'shipping' | 'total';
  created_at: string;
  updated_at: string;
}

export const discountService = {
  async applyDiscount(payload: DiscountApplyPayload): Promise<DiscountApplyResult> {
    console.log('🎫 Frontend: Applying discount with payload:', payload);
    
    const authHeaders = await getAuthHeaders();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    const url = buildApiUrl('/api/discounts/apply');
    console.log('🎫 Frontend: Sending request to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('🎫 Frontend: Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎫 Frontend: Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to apply discount' };
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to apply discount');
      }

      const result = await response.json();
      console.log('🎫 Frontend: Success response:', result);
      return result.data as DiscountApplyResult;
    } catch (error: any) {
      console.error('🎫 Frontend: Exception applying discount:', error);
      throw error;
    }
  },

  // Get all discounts
  async getDiscounts(): Promise<Discount[]> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching discounts:', error);
      return [];
    }
  },

  // Get active discounts
  async getActiveDiscounts(): Promise<Discount[]> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active discounts:', error);
      return [];
    }
  },

  // Create discount
  async createDiscount(discount: Omit<Discount, 'id' | 'created_at' | 'updated_at' | 'used_count'>): Promise<Discount | null> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .insert([{ ...discount, used_count: 0 }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating discount:', error);
      return null;
    }
  },

  // Update discount
  async updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount | null> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update(discount)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating discount:', error);
      return null;
    }
  },

  // Delete discount
  async deleteDiscount(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting discount:', error);
      return false;
    }
  },

  // Calculate discount for an amount
  async calculateDiscount(amount: number, type: string = 'all'): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_discount', { amount, discount_type: type });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error calculating discount:', error);
      return 0;
    }
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discounts')
        .update({ used_count: ((await supabase.from('discounts').select('used_count').eq('id', id).single()).data?.used_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  },
};

export default discountService;
