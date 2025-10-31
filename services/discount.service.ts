import { supabase } from '@/lib/supabase';

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
        .update({ used_count: supabase.raw('used_count + 1') })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  },
};
