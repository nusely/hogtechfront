'use client';

import { useState } from 'react';
import { AlertCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { discountService } from '@/services/discount.service';

interface CouponCodeProps {
  onCouponApplied: (result: any) => void;
  onCouponRemoved: () => void;
  cartTotal: number;
  appliedCoupon?: any | null;
  deliveryFee?: number;
  items?: any[];
}

export const CouponCode: React.FC<CouponCodeProps> = ({
  onCouponApplied,
  onCouponRemoved,
  cartTotal,
  appliedCoupon,
  deliveryFee = 0,
  items = []
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price || item.original_price,
          subtotal: item.subtotal
        }))
      };

      const result = await discountService.applyDiscount(payload);
      
      onCouponApplied(result);
      setCode('');
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      setError(error.message || 'Failed to apply coupon');
      toast.error(error.message || 'Failed to apply coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCode('');
    setError('');
    toast.success('Coupon removed');
  };

  const getDiscountText = (coupon: any) => {
    if (coupon.discountAmount > 0) {
       return `GHS ${coupon.discountAmount.toFixed(2)} discount applied`;
    }
    if (coupon.adjustedDeliveryFee === 0 && deliveryFee > 0) {
      return 'Free delivery applied';
    }
    return 'Discount applied';
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ticket size={18} className="text-[#00afef]" />
        <h3 className="font-semibold text-gray-900">Coupon Code</h3>
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-green-800">{appliedCoupon.code}</p>
              <p className="text-xs text-green-600">
                {getDiscountText(appliedCoupon)}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00afef] text-sm uppercase"
              maxLength={15}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isLoading || !code.trim()}
              className="px-4"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

