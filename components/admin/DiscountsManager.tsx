'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Percent, DollarSign, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Discount {
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

export function DiscountsManager() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minimum_amount: 0,
    maximum_discount: 0,
    is_active: true,
    valid_from: new Date().toISOString(),
    valid_until: '',
    usage_limit: 0,
    applies_to: 'all',
  });

  useEffect(() => {
    if (newDiscount.type === 'percentage' && newDiscount.applies_to !== 'products') {
      setNewDiscount((prev) => ({
        ...prev,
        applies_to: 'products',
      }));
    }
  }, [newDiscount.type, newDiscount.applies_to]);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const errorStr = String(JSON.stringify(error)).toLowerCase();
        const errorMessage = String(error.message || '').toLowerCase();
        const errorCode = String(error.code || '');

        if (
          errorCode === '42P01' ||
          errorCode === 'PGRST116' ||
          errorCode === 'PGRST205' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('could not find the table') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found') ||
          errorStr.includes('does not exist') ||
          errorStr.includes('could not find the table') ||
          errorStr.includes('relation') ||
          errorStr.includes('not found') ||
          Object.keys(error).length === 0
        ) {
          setDiscounts([]);
          return;
        }
        throw error;
      }
      setDiscounts(data || []);
    } catch (error: any) {
      const errorStr = String(JSON.stringify(error || {})).toLowerCase();
      const errorMessage = String(error?.message || '').toLowerCase();
      const errorCode = String(error?.code || '');

      if (
        errorCode === '42P01' ||
        errorCode === 'PGRST116' ||
        errorCode === 'PGRST205' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('could not find the table') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('not found') ||
        errorStr.includes('does not exist') ||
        errorStr.includes('could not find the table') ||
        errorStr.includes('relation') ||
        errorStr.includes('not found') ||
        Object.keys(error || {}).length === 0
      ) {
        setDiscounts([]);
      } else {
        console.error('Error fetching discounts:', error);
        toast.error('Failed to fetch discounts');
        setDiscounts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewDiscount({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimum_amount: 0,
      maximum_discount: 0,
      is_active: true,
      valid_from: new Date().toISOString(),
      valid_until: '',
      usage_limit: 0,
      applies_to: 'all',
    });
    setEditingDiscount(null);
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCode = (newDiscount.name || '').trim().toUpperCase();

    if (!normalizedCode) {
      toast.error('Discount code is required');
      return;
    }

    try {
      const payload = {
        ...newDiscount,
        name: normalizedCode,
        valid_from: newDiscount.valid_from || new Date().toISOString(),
        valid_until: newDiscount.valid_until || null,
        usage_limit: newDiscount.usage_limit || null,
        maximum_discount: newDiscount.maximum_discount || null,
        applies_to: newDiscount.type === 'percentage' ? 'products' : newDiscount.applies_to,
      };

      const { error } = await supabase.from('discounts').insert([payload]);

      if (error) {
        const errorStr = String(JSON.stringify(error || {})).toLowerCase();
        const errorMessage = String(error.message || '').toLowerCase();
        const errorCode = String(error.code || '');

        if (
          errorCode === '42P01' ||
          errorCode === 'PGRST116' ||
          errorCode === 'PGRST205' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('could not find the table') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found') ||
          errorStr.includes('does not exist') ||
          errorStr.includes('could not find the table') ||
          errorStr.includes('relation') ||
          errorStr.includes('not found') ||
          Object.keys(error || {}).length === 0
        ) {
          toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
          return;
        }
        throw error;
      }
      toast.success('Discount created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      const errorStr = String(JSON.stringify(error || {})).toLowerCase();
      const errorMessage = String(error?.message || '').toLowerCase();
      const errorCode = String(error?.code || '');

      if (
        errorCode === '42P01' ||
        errorCode === 'PGRST116' ||
        errorCode === 'PGRST205' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('could not find the table') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('not found') ||
        errorStr.includes('does not exist') ||
        errorStr.includes('could not find the table') ||
        errorStr.includes('relation') ||
        errorStr.includes('not found') ||
        Object.keys(error || {}).length === 0
      ) {
        toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        console.error('Error creating discount:', error);
        toast.error('Failed to create discount');
      }
    }
  };

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount) return;

    try {
      const normalizedCode = (newDiscount.name || '').trim().toUpperCase();

      if (!normalizedCode) {
        toast.error('Discount code is required');
        return;
      }

      const payload = {
        ...newDiscount,
        name: normalizedCode,
        valid_from: newDiscount.valid_from || editingDiscount.valid_from,
        valid_until: newDiscount.valid_until || null,
        usage_limit: newDiscount.usage_limit || null,
        maximum_discount: newDiscount.maximum_discount || null,
        applies_to: newDiscount.type === 'percentage' ? 'products' : newDiscount.applies_to,
      };

      const { error } = await supabase
        .from('discounts')
        .update(payload)
        .eq('id', editingDiscount.id);

      if (error) {
        const errorStr = String(JSON.stringify(error || {})).toLowerCase();
        const errorMessage = String(error.message || '').toLowerCase();
        const errorCode = String(error.code || '');

        if (
          errorCode === '42P01' ||
          errorCode === 'PGRST116' ||
          errorCode === 'PGRST205' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('could not find the table') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found') ||
          errorStr.includes('does not exist') ||
          errorStr.includes('could not find the table') ||
          errorStr.includes('relation') ||
          errorStr.includes('not found') ||
          Object.keys(error || {}).length === 0
        ) {
          toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
          return;
        }
        throw error;
      }
      toast.success('Discount updated successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      const errorStr = String(JSON.stringify(error || {})).toLowerCase();
      const errorMessage = String(error?.message || '').toLowerCase();
      const errorCode = String(error?.code || '');

      if (
        errorCode === '42P01' ||
        errorCode === 'PGRST116' ||
        errorCode === 'PGRST205' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('could not find the table') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('not found') ||
        errorStr.includes('does not exist') ||
        errorStr.includes('could not find the table') ||
        errorStr.includes('relation') ||
        errorStr.includes('not found') ||
        Object.keys(error || {}).length === 0
      ) {
        toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        console.error('Error updating discount:', error);
        toast.error('Failed to update discount');
      }
    }
  };

  const handleDeleteDiscount = async (discount: Discount) => {
    if (!confirm(`Are you sure you want to delete the discount "${discount.name}"?`)) return;

    try {
      const { error } = await supabase.from('discounts').delete().eq('id', discount.id);

      if (error) {
        const errorStr = String(JSON.stringify(error || {})).toLowerCase();
        const errorMessage = String(error.message || '').toLowerCase();
        const errorCode = String(error.code || '');

        if (
          errorCode === '42P01' ||
          errorCode === 'PGRST116' ||
          errorCode === 'PGRST205' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('could not find the table') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found') ||
          errorStr.includes('does not exist') ||
          errorStr.includes('could not find the table') ||
          errorStr.includes('relation') ||
          errorStr.includes('not found') ||
          Object.keys(error || {}).length === 0
        ) {
          toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
          return;
        }
        throw error;
      }
      toast.success('Discount deleted successfully!');
      fetchDiscounts();
    } catch (error: any) {
      const errorStr = String(JSON.stringify(error || {})).toLowerCase();
      const errorMessage = String(error?.message || '').toLowerCase();
      const errorCode = String(error?.code || '');

      if (
        errorCode === '42P01' ||
        errorCode === 'PGRST116' ||
        errorCode === 'PGRST205' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('could not find the table') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('not found') ||
        errorStr.includes('does not exist') ||
        errorStr.includes('could not find the table') ||
        errorStr.includes('relation') ||
        errorStr.includes('not found') ||
        Object.keys(error || {}).length === 0
      ) {
        toast.error('Discounts table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        console.error('Error deleting discount:', error);
        toast.error('Failed to delete discount');
      }
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setNewDiscount({
      ...discount,
      name: (discount.name || '').toUpperCase(),
      valid_until: discount.valid_until || '',
      usage_limit: discount.usage_limit || 0,
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discount Rules</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage coupons and promotional discounts available to customers.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <Plus size={18} className="mr-2" />
          Add Discount
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applies To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading discounts...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No discount rules yet. Click "Add Discount" to create one.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00afef]/10 text-[#00afef] rounded-lg">
                          <Percent size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{discount.name?.toUpperCase()}</p>
                          {discount.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{discount.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {discount.type === 'percentage' ? <Percent size={16} /> : discount.type === 'free_shipping' ? <Truck size={16} /> : <DollarSign size={16} />}
                        {discount.type === 'free_shipping'
                          ? 'Free Shipping'
                          : `${discount.value}${discount.type === 'percentage' ? '%' : ' GHS'}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info" className="text-xs capitalize">
                        {discount.applies_to}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {new Date(discount.valid_from).toLocaleDateString()} -{' '}
                          {discount.valid_until ? new Date(discount.valid_until).toLocaleDateString() : 'No end'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={discount.is_active ? 'success' : 'default'}
                        className={`text-xs ${discount.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditDiscount(discount)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(discount)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingDiscount ? 'Edit Discount Rule' : 'Create Discount Rule'}
                </h3>
                <p className="text-xs text-gray-500">Define how this discount is applied during checkout.</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Trash2 size={18} className="rotate-45 text-gray-400" />
              </button>
            </div>

            <form onSubmit={editingDiscount ? handleUpdateDiscount : handleCreateDiscount} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                  <input
                    type="text"
                    value={newDiscount.name || ''}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        name: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newDiscount.type || 'percentage'}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        type: e.target.value as Discount['type'],
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDiscount.value || 0}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        value: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    disabled={newDiscount.type === 'free_shipping'}
                    required={newDiscount.type !== 'free_shipping'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDiscount.minimum_amount || 0}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        minimum_amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDiscount.maximum_discount || 0}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        maximum_discount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={newDiscount.usage_limit || 0}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        usage_limit: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    placeholder="0 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={new Date(newDiscount.valid_from || new Date()).toISOString().slice(0, 16)}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, valid_from: new Date(e.target.value).toISOString() }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={newDiscount.valid_until ? new Date(newDiscount.valid_until).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        valid_until: e.target.value ? new Date(e.target.value).toISOString() : '',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    placeholder="Leave empty for no end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    value={newDiscount.applies_to || 'all'}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        applies_to: e.target.value as Discount['applies_to'],
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                  >
                    <option value="all" disabled={newDiscount.type === 'percentage'}>
                      Entire Order
                    </option>
                    <option value="products">Products Only</option>
                    <option value="shipping" disabled={newDiscount.type === 'percentage'}>
                      Shipping
                    </option>
                    <option value="total" disabled={newDiscount.type === 'percentage'}>
                      Order Total
                    </option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newDiscount.is_active ?? true}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-[#00afef] focus:ring-[#00afef]"
                  />
                  Discount is active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingDiscount ? 'Update Discount' : 'Create Discount'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
