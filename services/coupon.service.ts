import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types/coupon';

// Get all coupons (admin only)
export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return [];
  }
};

// Get active coupons
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch active coupons:', error);
    return [];
  }
};

// Validate coupon code
export const validateCoupon = async (code: string, cartAmount: number = 0) => {
  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: code,
      cart_amount: cartAmount
    });

    if (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }

    return data[0] || { is_valid: false, discount_amount: 0, error_message: 'Invalid coupon' };
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return { is_valid: false, discount_amount: 0, error_message: 'Failed to validate coupon' };
  }
};

// Generate new coupon code
export const generateCouponCode = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_coupon_code');

    if (error) {
      console.error('Error generating coupon code:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to generate coupon code:', error);
    // Fallback: generate random code (exactly 8 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Create new coupon
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>): Promise<Coupon | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create coupons');
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...couponData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create coupon:', error);
    throw error;
  }
};

// Update coupon
export const updateCoupon = async (couponId: string, updates: Partial<Coupon>): Promise<Coupon | null> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId)
      .select()
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update coupon:', error);
    throw error;
  }
};

// Delete coupon
export const deleteCoupon = async (couponId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    throw error;
  }
};

// Increment coupon usage
export const incrementCouponUsage = async (couponId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .update({
        used_count: supabase.raw('used_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId);

    if (error) {
      console.error('Error incrementing coupon usage:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to increment coupon usage:', error);
    throw error;
  }
};

// Export as object for convenience
export const couponService = {
  getAllCoupons,
  getActiveCoupons,
  validateCoupon,
  generateCouponCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage,
};
