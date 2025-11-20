'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Coupon, CreateCouponDto, createCoupon, updateCoupon } from '@/services/coupon.service';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coupon?: Coupon | null; // If provided, we are editing
}

export function CouponModal({ isOpen, onClose, onSuccess, coupon }: CouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateCouponDto>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: null,
    start_date: new Date().toISOString().split('T')[0], // Default to today
    end_date: null,
    usage_limit: null,
    per_user_limit: null,
    is_active: true,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase_amount: coupon.min_purchase_amount,
        max_discount_amount: coupon.max_discount_amount,
        start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().split('T')[0] : '',
        end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : null,
        usage_limit: coupon.usage_limit,
        per_user_limit: coupon.per_user_limit,
        is_active: coupon.is_active,
      });
    } else {
      // Reset for create
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase_amount: 0,
        max_discount_amount: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        usage_limit: null,
        per_user_limit: null,
        is_active: true,
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      toast.error('Coupon code is required');
      return;
    }

    if (formData.discount_value === undefined || formData.discount_value < 0) {
      toast.error('Valid discount value is required');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload: CreateCouponDto = {
        ...formData as CreateCouponDto,
        // Ensure dates are ISO strings with time
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (coupon) {
        await updateCoupon(coupon.id, payload);
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef] uppercase"
                placeholder="SUMMER2024"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                placeholder="Summer Sale Discount"
              />
            </div>
          </div>

          {/* Discount Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (GHS)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Value *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                disabled={formData.discount_type === 'free_shipping'}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Discount (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.max_discount_amount || ''}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                placeholder="No limit"
              />
            </div>
          </div>

          {/* Requirements & Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Purchase (GHS)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Total Usage Limit</label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Per User Limit</label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.per_user_limit || ''}
                onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                placeholder="Unlimited"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-[#00afef] focus:ring-[#00afef] border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active immediately
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

