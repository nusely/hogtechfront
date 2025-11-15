'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Percent, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Tax {
  id: string;
  name: string;
  description?: string;
  rate: number;
  type: 'percentage' | 'fixed';
  is_active: boolean;
  applies_to: 'all' | 'products' | 'shipping' | 'total';
  created_at: string;
  updated_at: string;
}

export function TaxesManager() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [newTax, setNewTax] = useState<Partial<Tax>>({
    name: '',
    description: '',
    rate: 0,
    type: 'percentage',
    is_active: true,
    applies_to: 'all',
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('taxes')
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
          setTaxes([]);
          return;
        }
        throw error;
      }
      setTaxes(data || []);
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
        setTaxes([]);
      } else {
        console.error('Error fetching taxes:', error);
        toast.error('Failed to fetch taxes');
        setTaxes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTax.name || !newTax.name.trim()) {
      toast.error('Tax name is required');
      return;
    }
    
    if (newTax.rate === undefined || newTax.rate === null) {
      toast.error('Tax rate is required');
      return;
    }
    
    // Validate rate constraints: must be between 0 and 1 for percentage, or >= 0 for fixed
    if (newTax.type === 'percentage' && (newTax.rate < 0 || newTax.rate > 1)) {
      toast.error('Percentage rate must be between 0 and 1 (e.g., 0.15 for 15%)');
      return;
    }
    
    if (newTax.type === 'fixed' && newTax.rate < 0) {
      toast.error('Fixed rate must be greater than or equal to 0');
      return;
    }
    
    try {
      // Prepare the tax data with proper formatting
      const taxData = {
        name: newTax.name.trim(),
        description: newTax.description || null,
        rate: Number(newTax.rate),
        type: newTax.type || 'percentage',
        is_active: newTax.is_active ?? true,
        applies_to: newTax.applies_to || 'all',
      };
      
      console.log('Creating tax with data:', taxData);
      
      const { data, error } = await supabase.from('taxes').insert([taxData]).select();

      if (error) {
        console.error('Supabase error creating tax:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        
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
          errorStr.includes('not found')
        ) {
          toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
        } else if (errorMessage.includes('permission') || errorMessage.includes('policy') || errorCode === '42501') {
          toast.error('Permission denied. Please ensure you are logged in as an admin.');
        } else if (errorMessage.includes('check') || errorMessage.includes('constraint')) {
          toast.error(`Validation error: ${error.message || 'Invalid tax data'}`);
        } else {
          toast.error(`Failed to create tax: ${error.message || 'Unknown error'}`);
        }
        return;
      }
      
      toast.success('Tax created successfully!');
      setShowCreateModal(false);
      setNewTax({
        name: '',
        description: '',
        rate: 0,
        type: 'percentage',
        is_active: true,
        applies_to: 'all',
      });
      fetchTaxes();
    } catch (error: any) {
      console.error('Error creating tax:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
        name: error?.name,
      });
      
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
        errorStr.includes('not found')
      ) {
        toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        toast.error(`Failed to create tax: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const handleUpdateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTax) return;

    try {
      const { error } = await supabase.from('taxes').update(newTax).eq('id', editingTax.id);

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
          toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
          return;
        }
        throw error;
      }
      toast.success('Tax updated successfully!');
      setEditingTax(null);
      setNewTax({
        name: '',
        description: '',
        rate: 0,
        type: 'percentage',
        is_active: true,
        applies_to: 'all',
      });
      fetchTaxes();
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
        toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        console.error('Error updating tax:', error);
        toast.error('Failed to update tax');
      }
    }
  };

  const handleDeleteTax = async (tax: Tax) => {
    if (!confirm(`Are you sure you want to delete the tax "${tax.name}"?`)) return;

    try {
      const { error } = await supabase.from('taxes').delete().eq('id', tax.id);

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
          toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
          return;
        }
        throw error;
      }
      toast.success('Tax deleted successfully!');
      fetchTaxes();
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
        toast.error('Taxes table does not exist. Please run the create_taxes_discounts_system.sql migration in Supabase.');
      } else {
        console.error('Error deleting tax:', error);
        toast.error('Failed to delete tax');
      }
    }
  };

  const handleEditTax = (tax: Tax) => {
    setEditingTax(tax);
    setNewTax({ ...tax });
    setShowCreateModal(true);
  };

  const handleCreateNew = () => {
    setEditingTax(null);
    setNewTax({
      name: '',
      description: '',
      rate: 0,
      type: 'percentage',
      is_active: true,
      applies_to: 'all',
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setEditingTax(null);
    setNewTax({
      name: '',
      description: '',
      rate: 0,
      type: 'percentage',
      is_active: true,
      applies_to: 'all',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tax Rules</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage the tax rules that apply during checkout.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <Plus size={18} className="mr-2" />
          Add Tax Rule
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applies To
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
                    Loading taxes...
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No tax rules found. Click "Add Tax Rule" to create one.
                  </td>
                </tr>
              ) : (
                taxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00afef]/10 text-[#00afef] rounded-lg">
                          <Settings size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tax.name}</p>
                          {tax.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{tax.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {tax.type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                        {tax.rate}
                        {tax.type === 'percentage' ? '%' : ' GHS'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info" className="text-xs capitalize">
                        {tax.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info" className="text-xs capitalize">
                        {tax.applies_to}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={tax.is_active ? 'success' : 'default'}
                        className={`text-xs ${tax.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {tax.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditTax(tax)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTax(tax)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTax ? 'Edit Tax Rule' : 'Create Tax Rule'}
                </h3>
                <p className="text-xs text-gray-500">
                  Configure how this tax applies to orders.
                </p>
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

            <form onSubmit={editingTax ? handleUpdateTax : handleCreateTax} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newTax.name || ''}
                    onChange={(e) => setNewTax((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTax.rate || 0}
                    onChange={(e) => setNewTax((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newTax.type || 'percentage'}
                    onChange={(e) => setNewTax((prev) => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    value={newTax.applies_to || 'all'}
                    onChange={(e) =>
                      setNewTax((prev) => ({
                        ...prev,
                        applies_to: e.target.value as Tax['applies_to'],
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                  >
                    <option value="all">All Orders</option>
                    <option value="products">Products Only</option>
                    <option value="shipping">Shipping Only</option>
                    <option value="total">Order Total</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTax.description || ''}
                    onChange={(e) => setNewTax((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]"
                    rows={3}
                    placeholder="Optional description for internal reference"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newTax.is_active ?? true}
                    onChange={(e) => setNewTax((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-[#00afef] focus:ring-[#00afef]"
                  />
                  Tax is active
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
                  {editingTax ? 'Update Tax' : 'Create Tax'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
