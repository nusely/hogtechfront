'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { 
  getAllFlashDealsAdmin, 
  addProductToFlashDeal,
  FlashDeal 
} from '@/services/flashDeal.service';

interface AddProductToDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  onSuccess?: () => void;
}

export function AddProductToDealModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  onSuccess,
}: AddProductToDealModalProps) {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [flashPrice, setFlashPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFlashDeals();
    }
  }, [isOpen]);

  const fetchFlashDeals = async () => {
    try {
      setLoading(true);
      const deals = await getAllFlashDealsAdmin(true);
      setFlashDeals(deals);
    } catch (error: any) {
      console.error('Error fetching flash deals:', error);
      toast.error(error.message || 'Failed to load flash deals');
    } finally {
      setLoading(false);
    }
  };

  const calculateFlashPrice = (discount: number) => {
    if (!productPrice || discount <= 0) return '';
    const price = productPrice * (1 - discount / 100);
    return price.toFixed(2);
  };

  const handleDiscountChange = (value: string) => {
    setDiscountPercentage(value);
    if (value && !isNaN(parseFloat(value))) {
      const discount = parseFloat(value);
      if (discount >= 0 && discount <= 100) {
        const calculatedPrice = calculateFlashPrice(discount);
        setFlashPrice(calculatedPrice);
      }
    } else {
      setFlashPrice('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDealId) {
      toast.error('Please select a flash deal');
      return;
    }

    if (!discountPercentage || isNaN(parseFloat(discountPercentage))) {
      toast.error('Please enter a valid discount percentage');
      return;
    }

    const discount = parseFloat(discountPercentage);
    if (discount < 0 || discount > 100) {
      toast.error('Discount percentage must be between 0 and 100');
      return;
    }

    try {
      setSaving(true);
      await addProductToFlashDeal(selectedDealId, {
        product_id: productId,
        discount_percentage: discount,
        flash_price: flashPrice ? parseFloat(flashPrice) : undefined,
      });
      toast.success('Product added to flash deal successfully');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error adding product to deal:', error);
      toast.error(error.message || 'Failed to add product to flash deal');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedDealId('');
    setDiscountPercentage('');
    setFlashPrice('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add Product to Flash Deal</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <p className="text-sm text-gray-900 font-medium">{productName}</p>
            <p className="text-xs text-gray-500">Price: GHS {productPrice.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flash Deal *
            </label>
            {loading ? (
              <p className="text-sm text-gray-500">Loading flash deals...</p>
            ) : flashDeals.length === 0 ? (
              <p className="text-sm text-gray-500">No flash deals available. Create one first.</p>
            ) : (
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select a flash deal</option>
                {flashDeals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title} {deal.is_active ? '(Active)' : '(Inactive)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage *
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountPercentage}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="e.g., 20 for 20% off"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a number between 0 and 100
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flash Price (Optional)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={flashPrice}
              onChange={(e) => setFlashPrice(e.target.value)}
              placeholder="Auto-calculated from discount"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will be calculated automatically if not specified
            </p>
          </div>

          {flashPrice && discountPercentage && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900">
                New Price: GHS {parseFloat(flashPrice).toFixed(2)}
              </p>
              <p className="text-xs text-orange-700">
                Original: GHS {productPrice.toFixed(2)} - {discountPercentage}% = GHS {parseFloat(flashPrice).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" onClick={handleClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !selectedDealId || !discountPercentage}>
              {saving ? 'Adding...' : 'Add to Deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

