'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { 
  getAllDeals,
  addProductToDeal,
  Deal
} from '@/services/deal.service';
import { formatCurrency } from '@/lib/helpers';

interface AddProductToDealFromProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  onSuccess?: () => void;
}

export function AddProductToDealFromProductModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  onSuccess,
}: AddProductToDealFromProductModalProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [dealPrice, setDealPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDeals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (discountPercentage) {
      const discount = parseInt(discountPercentage);
      if (!isNaN(discount) && discount > 0 && discount <= 100) {
        setDealPrice((productPrice * (1 - discount / 100)).toFixed(2));
      } else {
        setDealPrice('');
      }
    } else {
      setDealPrice('');
    }
  }, [discountPercentage, productPrice]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const dealsData = await getAllDeals(true); // Get all deals including inactive
      setDeals(dealsData);
      if (dealsData.length > 0) {
        setSelectedDealId(dealsData[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) {
      toast.error('Please select a deal.');
      return;
    }
    
    if (!discountPercentage && !dealPrice) {
      toast.error('Please enter either a discount percentage or deal price.');
      return;
    }

    setSaving(true);
    try {
      await addProductToDeal(selectedDealId, {
        product_id: productId,
        discount_percentage: discountPercentage ? parseInt(discountPercentage) : undefined,
        deal_price: dealPrice ? parseFloat(dealPrice) : undefined,
      });
      toast.success(`${productName} added to deal!`);
      onSuccess?.();
      onClose();
      // Reset form
      setSelectedDealId(deals[0]?.id || '');
      setDiscountPercentage('');
      setDealPrice('');
    } catch (error: any) {
      console.error('Error adding product to deal:', error);
      toast.error(error.message || 'Failed to add product to deal.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add "{productName}" to Deal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00afef]"></div>
            </div>
          ) : deals.length === 0 ? (
            <p className="text-center text-gray-600">No deals available. Create one first in Admin &gt; Marketing &gt; Deals.</p>
          ) : (
            <>
              <div>
                <Label htmlFor="deal">Select Deal</Label>
                <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                  <SelectTrigger id="deal">
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.title} ({new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if using fixed deal price
                </p>
              </div>

              <div>
                <Label htmlFor="dealPrice">Or Fixed Deal Price (GHS)</Label>
                <Input
                  id="dealPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  placeholder="e.g., 500.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if using discount percentage
                </p>
              </div>

              {dealPrice && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Original Price: <span className="line-through">{formatCurrency(productPrice)}</span>
                  </p>
                  <p className="text-sm font-semibold text-[#163b86]">
                    Deal Price: {formatCurrency(parseFloat(dealPrice) || 0)}
                  </p>
                  {discountPercentage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Discount: {discountPercentage}%
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add to Deal'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

