export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  minimum_amount: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CouponValidation {
  is_valid: boolean;
  discount_amount: number;
  error_message: string;
}

export interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateCouponData {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed_amount' | 'free_delivery';
  value?: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
}

