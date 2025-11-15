'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductPicker } from '@/components/admin/ProductPicker';
import { supabase } from '@/lib/supabase';
import { Product, CartItem } from '@/types/product';
import { orderService } from '@/services/order.service';
import { taxService, Tax } from '@/services/tax.service';
import { AppliedTax, DeliveryOption } from '@/types/order';
import { formatCurrency } from '@/lib/helpers';
import toast from 'react-hot-toast';
import { buildApiUrl } from '@/lib/api';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  adminEmail: string;
}

interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  user_id?: string | null;
  source?: string | null;
}

interface SelectedProductLine {
  product: Product;
  quantity: number;
}

const getUnitPrice = (product: Product): number => {
  const priceCandidates = [
    product.discount_price,
    (product as any)?.price,
    product.original_price,
  ];

  for (const candidate of priceCandidates) {
    if (candidate !== null && candidate !== undefined) {
      const numeric = typeof candidate === 'string' ? parseFloat(candidate) : Number(candidate);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
  }

  return 0;
};

export function CreateOrderModal({ isOpen, onClose, onCreated, adminEmail }: CreateOrderModalProps) {
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductLine[]>([]);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [newCustomer, setNewCustomer] = useState({ fullName: '', email: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxRules, setTaxRules] = useState<Tax[]>([]);
  const [orderAddress, setOrderAddress] = useState({
    street: '',
    city: '',
    region: '',
    postal: '',
    phone: '',
  });
  const [requiresDelivery, setRequiresDelivery] = useState(true);

  useEffect(() => {
    if (isOpen) {
      void (async () => {
        try {
          const activeTaxes = await taxService.getActiveTaxes();
          setTaxRules(activeTaxes);
        } catch (error) {
          console.error('Error fetching taxes:', error);
          setTaxRules([]);
        }
      })();
    } else {
      setSelectedProducts([]);
      setCustomerMode('existing');
      setCustomerSearch('');
      setCustomerResults([]);
      setSelectedCustomer(null);
      setNewCustomer({ fullName: '', email: '', phone: '' });
      setOrderAddress({ street: '', city: '', region: '', postal: '', phone: '' });
      setRequiresDelivery(true);
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerMode === 'new') {
      const trimmedPhone = newCustomer.phone.trim();
      if (trimmedPhone) {
        setOrderAddress((prev) =>
          prev.phone.trim().length === 0 ? { ...prev, phone: trimmedPhone } : prev
        );
      }
    }
  }, [customerMode, newCustomer.phone]);

  useEffect(() => {
    if (selectedCustomer?.phone) {
      setOrderAddress((prev) => ({ ...prev, phone: selectedCustomer.phone || prev.phone }));
    }
  }, [selectedCustomer]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, line) => sum + getUnitPrice(line.product) * line.quantity, 0);
  }, [selectedProducts]);

  const deliveryFee = 0;

  const taxComputation = useMemo(() => {
    const breakdown: AppliedTax[] = [];
    const productBase = Math.max(subtotal, 0);
    const shippingBase = Math.max(deliveryFee, 0);
    const combinedBase = productBase + shippingBase;

    if (taxRules.length > 0) {
      let totalTax = 0;

      taxRules.forEach((rule) => {
        const base =
          rule.applies_to === 'products'
            ? productBase
            : rule.applies_to === 'shipping'
            ? shippingBase
            : combinedBase;

        let amount = 0;
        if (rule.type === 'percentage') {
          if (base > 0) {
            const normalizedRate = rule.rate > 1 ? rule.rate / 100 : rule.rate;
            amount = Number((base * normalizedRate).toFixed(2));
          }
        } else {
          amount = Number(Number(rule.rate).toFixed(2));
        }

        totalTax += amount;
        breakdown.push({
          id: rule.id,
          name: rule.name,
          type: rule.type,
          applies_to: rule.applies_to,
          rate: rule.rate,
          amount,
        });
      });

      const roundedTotal = Number(totalTax.toFixed(2));
      const effectiveRate = productBase > 0 ? Number(((roundedTotal / productBase) * 100).toFixed(2)) : 0;

      return {
        total: roundedTotal,
        breakdown,
        effectiveRate,
      };
    }

    return {
      total: 0,
      breakdown,
      effectiveRate: 0,
    };
  }, [taxRules, subtotal, deliveryFee]);

  const taxAmount = taxComputation.total;
  const appliedTaxBreakdown = taxComputation.breakdown;
  const effectiveTaxRate = taxComputation.effectiveRate;
  const grandTotal = Math.max(subtotal + deliveryFee + taxAmount, 0);

  const handleAddProduct = () => {
    setShowProductPicker(true);
  };

  const handleProductSelected = async (productSummary: { id: string }) => {
    try {
      setShowProductPicker(false);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productSummary.id)
        .single();

      if (error || !data) {
        throw error || new Error('Product not found');
      }

      const product = data as Product;

      setSelectedProducts((prev) => {
        const existing = prev.find((line) => line.product.id === product.id);
        if (existing) {
          return prev.map((line) =>
            line.product.id === product.id
              ? { ...line, quantity: line.quantity + 1 }
              : line
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    } catch (error) {
      console.error('Error selecting product:', error);
      toast.error('Failed to add product. Please try again.');
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts((prev) =>
      prev.map((line) =>
        line.product.id === productId ? { ...line, quantity } : line
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((line) => line.product.id !== productId));
  };

  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) {
      toast.error('Enter a name, email, or phone to search.');
      return;
    }

    try {
      setCustomerLoading(true);
      const query = customerSearch.trim();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error('Authentication expired. Please refresh and try again.');
        return;
      }

      const response = await fetch(buildApiUrl(`/api/customers?q=${encodeURIComponent(query)}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || result?.error || 'Failed to search customers.');
      }

      const results: CustomerSummary[] = (result.data || []).map((customer: any) => ({
        id: customer.id,
        full_name: customer.full_name || customer.email || 'Customer',
        email: customer.email || '',
        phone: customer.phone || null,
        user_id: customer.user_id || null,
        source: customer.source || null,
      }));

      if (results.length === 0) {
        toast.error('No customers found for that query.');
      }

      setCustomerResults(results);
    } catch (error) {
      console.error('Error searching customers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to search customers.');
      setCustomerResults([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Add at least one product to create an order.');
      return;
    }

    let customerId: string | null = null;
    let customerName = '';
    let customerEmail = '';
    let customerPhone = '';

    const fallbackEmail = adminEmail || 'hedgehog.technologies1@gmail.com';

    const streetAddress = orderAddress.street.trim();
    const city = orderAddress.city.trim();
    const region = orderAddress.region.trim();
    const postalCode = orderAddress.postal.trim();
    let contactPhone = orderAddress.phone.trim();

    if (!contactPhone) {
      contactPhone = (selectedCustomer?.phone || '').trim() || newCustomer.phone.trim();
    }

    try {
      if (customerMode === 'existing') {
        if (!selectedCustomer) {
          toast.error('Select a customer before creating the order.');
          return;
        }
        customerId = selectedCustomer.id;
        customerName = selectedCustomer.full_name;
        customerEmail = selectedCustomer.email || fallbackEmail;
        customerPhone = selectedCustomer.phone?.trim() || '';
        contactPhone = selectedCustomer.phone?.trim() || contactPhone;
      } else {
        const fullName = newCustomer.fullName.trim();
        if (!fullName) {
          toast.error("Enter the customer's name.");
          return;
        }
        if (!newCustomer.phone.trim()) {
          toast.error('Customer phone number is required.');
          return;
        }
        const providedEmail = newCustomer.email.trim();
        const contactEmail = providedEmail || fallbackEmail;
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          toast.error('Authentication expired. Please refresh and try again.');
          return;
        }

        const payload: Record<string, unknown> = {
          full_name: fullName,
          email: providedEmail || null,
          phone: newCustomer.phone.trim(),
        };

        if (requiresDelivery) {
          payload.shipping_address = {
            full_name: fullName,
            email: contactEmail,
            phone: newCustomer.phone.trim(),
            street_address: streetAddress,
            city,
            region,
            postal_code: postalCode || null,
            country: 'Ghana',
          };
        }

        const response = await fetch(buildApiUrl('/api/customers'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || result?.error || 'Failed to create customer');
        }

        const data = result.data as CustomerSummary & { phone?: string | null; email?: string | null };

        customerId = data.id;
        customerName = data.full_name || fullName;
        customerEmail = providedEmail || contactEmail;
        customerPhone = data.phone?.trim() || newCustomer.phone.trim();
        contactPhone = data.phone?.trim() || contactPhone || newCustomer.phone.trim();
      }

      contactPhone = contactPhone?.trim() || customerPhone?.trim() || newCustomer.phone.trim();

      if (!contactPhone || contactPhone.length < 5) {
        toast.error('Enter a valid contact phone number.');
        return;
      }
      customerPhone = contactPhone;

      if (requiresDelivery) {
        if (!streetAddress) {
          toast.error('Enter the delivery street address.');
          return;
        }

        if (!city) {
          toast.error('Enter the delivery city.');
          return;
        }

        if (!region) {
          toast.error('Enter the delivery region.');
          return;
        }
      }

      const cartItems: CartItem[] = selectedProducts.map(({ product, quantity }) => {
        const unitPrice = getUnitPrice(product);
        const subtotalValue = Number((unitPrice * quantity).toFixed(2));
        return {
          ...(product as Product & { discount_price?: number | null; original_price?: number | null }),
          quantity,
          selected_variants: {},
          discount_price:
            product.discount_price !== null && product.discount_price !== undefined
              ? product.discount_price
              : unitPrice,
          original_price:
            product.original_price !== null && product.original_price !== undefined
              ? product.original_price
              : unitPrice,
          subtotal: subtotalValue,
        } as CartItem;
      });

      const deliveryOption: DeliveryOption = requiresDelivery
        ? {
            id: 'manual-admin',
            name: 'Manual Admin Order',
            description: 'Created by admin',
            price: deliveryFee,
            type: 'delivery',
          }
        : {
            id: 'manual-admin-pickup',
            name: 'In-store Pickup',
            description: 'Customer will pick up order in-store',
            price: 0,
            type: 'pickup',
          };

      const deliveryAddress = requiresDelivery
        ? {
            full_name: customerName,
            email: customerEmail,
            phone: contactPhone,
            street_address: streetAddress,
            city,
            region,
            postal_code: postalCode || undefined,
            country: 'Ghana',
          }
        : {
            full_name: customerName,
            email: customerEmail,
            phone: contactPhone,
            street_address: 'Pickup - No delivery address provided',
            city: city || 'N/A',
            region: region || 'N/A',
            postal_code: postalCode || undefined,
            country: 'Ghana',
          };

      setIsSubmitting(true);

      const trimmedNotes = notes.trim();

      const checkoutData = {
        items: cartItems,
        delivery_address: deliveryAddress,
        delivery_option: deliveryOption,
        payment_method: 'cash_on_delivery' as const,
        notes: trimmedNotes ? trimmedNotes : undefined,
        discount_code: undefined,
        discount_amount: 0,
        adjusted_delivery_fee: requiresDelivery ? deliveryFee : 0,
        tax_amount: taxAmount,
        tax_rate: effectiveTaxRate,
        tax_breakdown: appliedTaxBreakdown,
      };

      const createdOrder = await orderService.createOrder(checkoutData, {
        userId: customerMode === 'existing' ? selectedCustomer?.user_id || null : null,
        customerId,
      });

      toast.success(`Order ${createdOrder.order_number || 'created'} successfully!`);
      onCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating order:', error);
      const message =
        error?.message || error?.details || error?.hint || 'Failed to create order';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Create Manual Order</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-4 overflow-y-auto">
          {/* Customer Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 text-sm font-medium">
              <button
                className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                  customerMode === 'existing' ? 'bg-white shadow' : 'text-[#3A3A3A]'
                }`}
                onClick={() => setCustomerMode('existing')}
                type="button"
              >
                Existing Customer
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                  customerMode === 'new' ? 'bg-white shadow' : 'text-[#3A3A3A]'
                }`}
                onClick={() => setCustomerMode('new')}
                type="button"
              >
                New Customer
              </button>
            </div>

            {customerMode === 'existing' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search by name, email, or phone"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCustomerSearch}
                    isLoading={customerLoading}
                  >
                    Search
                  </Button>
                </div>

                {customerResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                    {customerResults.map((customer) => {
                      const isSelected = selectedCustomer?.id === customer.id;
                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className={`w-full text-left px-4 py-3 flex justify-between gap-4 transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-[#00afef]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-[#1A1A1A]">{customer.full_name}</p>
                            <p className="text-sm text-[#3A3A3A]">{customer.email || 'No email'}</p>
                          </div>
                          <span className="text-sm text-[#3A3A3A]">{customer.phone || 'No phone'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    <div>
                      <p className="font-semibold">Selected: {selectedCustomer.full_name}</p>
                      <p>{selectedCustomer.email || 'No email'}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newCustomer.fullName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Customer Email</label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="Optional – defaults to admin email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="e.g. 055 123 4567"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Order Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00afef]"
                placeholder="Special delivery instructions or remarks"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <input
                  type="checkbox"
                  checked={requiresDelivery}
                  onChange={(e) => setRequiresDelivery(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#00afef] border-gray-300 rounded focus:ring-[#00afef]"
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    Delivery Required?
                  </h3>
                  <p className="text-sm text-[#3A3A3A]">
                    Uncheck this if the customer will pick up the order in-store.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  value={orderAddress.phone}
                  onChange={(e) => setOrderAddress((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number for order updates"
                />
              </div>

              {requiresDelivery && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Delivery Address</h3>
                    <p className="text-sm text-[#3A3A3A]">
                      Provide the address if the order needs to be delivered
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={orderAddress.street}
                      onChange={(e) => setOrderAddress((prev) => ({ ...prev, street: e.target.value }))}
                      placeholder="House 10, Example Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={orderAddress.city}
                        onChange={(e) => setOrderAddress((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Accra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                        Region <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={orderAddress.region}
                        onChange={(e) => setOrderAddress((prev) => ({ ...prev, region: e.target.value }))}
                        placeholder="Greater Accra"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Postal Code</label>
                    <Input
                      value={orderAddress.postal}
                      onChange={(e) => setOrderAddress((prev) => ({ ...prev, postal: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Products</h3>
                <p className="text-sm text-[#3A3A3A]">Add products to the order</p>
              </div>
              <Button variant="outline" onClick={handleAddProduct} icon={<Plus size={16} />}>
                Add Product
              </Button>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-[#3A3A3A]">
                No products added yet
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map(({ product, quantity }) => {
                  const unitPrice = getUnitPrice(product);
                  return (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{product.name}</p>
                        <p className="text-sm text-[#3A3A3A]">{formatCurrency(unitPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-[#3A3A3A]">Qty</label>
                          <Input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                          {formatCurrency(unitPrice * quantity)}
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <div className="flex justify-between text-sm text-[#3A3A3A]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#3A3A3A]">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm text-[#3A3A3A]">
                  <span>Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#1A1A1A] border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-[#3A3A3A]">
            Payment method defaults to Cash on Delivery. You can update payment status from the
            transactions panel after confirming payment.
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateOrder}
              isLoading={isSubmitting}
              disabled={selectedProducts.length === 0}
            >
              Create Order
            </Button>
          </div>
        </div>
      </div>

      <ProductPicker
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={handleProductSelected}
      />
    </div>
  );
}
