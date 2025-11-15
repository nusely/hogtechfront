'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Mail, Package, User, MapPin, Calendar, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { formatOrderVariants } from '@/lib/variantFormatter';
import toast from 'react-hot-toast';
import { buildApiUrl } from '@/lib/api';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_variants?: any;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_fee: number;
  total: number;
  shipping_address: any;
  billing_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onStatusUpdate?: () => void;
}

export function OrderDetailModal({ isOpen, onClose, orderId, onStatusUpdate }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedShippingFee, setEditedShippingFee] = useState<string>('');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [formattedVariants, setFormattedVariants] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    if (isOpen && orderId && orderId.trim() !== '') {
      console.log('OrderDetailModal: Fetching order:', orderId);
      fetchOrder();
    } else {
      console.log('OrderDetailModal: Not fetching - isOpen:', isOpen, 'orderId:', orderId);
      if (isOpen && (!orderId || orderId.trim() === '')) {
        console.error('OrderDetailModal: orderId is empty or invalid');
        toast.error('Order ID is missing');
      }
    }
  }, [isOpen, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Try fetching via backend API first (bypasses RLS)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const orderData = result.data;
            const orderItems = orderData.order_items || orderData.items || [];
            
            const formattedOrder: Order = {
              ...orderData,
              items: orderItems,
              customer_name: orderData.user 
                ? `${orderData.user.first_name || ''} ${orderData.user.last_name || ''}`.trim() || 'Customer'
                : (orderData.shipping_address?.full_name || 'Guest Customer'),
              customer_email: orderData.user?.email || orderData.shipping_address?.email || 'No email',
            };
            
            console.log('Fetched order via API:', {
              orderId,
              itemsCount: orderItems.length,
              items: orderItems,
            });

            setOrder(formattedOrder);
            setEditedShippingFee(formattedOrder.shipping_fee?.toString() || '0');
            setEditedNotes(formattedOrder.notes || '');

            // Format variants for all items
            if (orderItems.length > 0) {
              const variantPromises = orderItems.map(async (item: any) => {
                if (item.selected_variants) {
                  const formatted = await formatOrderVariants(item.selected_variants);
                  return { itemId: item.id, formatted };
                }
                return { itemId: item.id, formatted: [] };
              });
              
              const results = await Promise.all(variantPromises);
              const variantsMap: { [key: string]: any[] } = {};
              results.forEach(({ itemId, formatted }) => {
                variantsMap[itemId] = formatted;
              });
              setFormattedVariants(variantsMap);
            }

            return;
          }
        }
      } catch (apiError) {
        console.warn('Backend API failed, trying Supabase:', apiError);
      }

      // Fallback: Fetch via Supabase (may have RLS restrictions)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:users!orders_user_id_fkey(id, first_name, last_name, email)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Order not found');

      // Fetch order items separately (to avoid RLS/join issues)
      let items: any[] = [];
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        // If RLS error, try backend API for items
        if (itemsError.message?.includes('policy') || itemsError.message?.includes('permission')) {
          console.warn('RLS policy blocking order_items, trying backend API...');
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            const itemsResponse = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/items`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });
            if (itemsResponse.ok) {
              const itemsResult = await itemsResponse.json();
              if (itemsResult.success && itemsResult.data) {
                items = itemsResult.data;
                console.log('Fetched order items via API:', items.length, 'items');
              }
            }
          } catch (apiItemsError) {
            console.error('Failed to fetch items via API:', apiItemsError);
          }
        }
      } else if (itemsData) {
        items = itemsData;
        console.log('Fetched order items:', items.length, 'items');
      }
      
      // Debug: Log what we got
      console.log('Order data:', {
        orderId,
        itemsCount: items.length,
        items: items,
      });
      
      // Get items from order_data or from separately fetched items
      const orderItems = items.length > 0 
        ? items 
        : (orderData.order_items || orderData.items || []);
      
      const formattedOrder: Order = {
        ...orderData,
        items: orderItems,
        customer_name: orderData.user 
          ? `${orderData.user.first_name || ''} ${orderData.user.last_name || ''}`.trim() || 'Customer'
          : (orderData.shipping_address?.full_name || 'Guest Customer'),
        customer_email: orderData.user?.email || orderData.shipping_address?.email || 'No email',
      };
      
      // Debug: Log what we got
      console.log('Formatted order:', {
        orderId,
        itemsCount: orderItems.length,
        items: orderItems,
        orderItemsFromData: orderData.order_items?.length || 0,
        itemsFromData: orderData.items?.length || 0,
      });

      setOrder(formattedOrder);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || updatingStatus) return;

    try {
      setUpdatingStatus(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      const result = await response.json();
      
      // Refresh order data
      await fetchOrder();
      
      // Notify parent to refresh orders list
      if (onStatusUpdate) {
        onStatusUpdate();
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!order || updatingDetails) return;

    try {
      setUpdatingDetails(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const updateData: any = {};
      if (editedShippingFee !== order.shipping_fee?.toString()) {
        updateData.shipping_fee = parseFloat(editedShippingFee) || 0;
      }
      if (editedNotes !== (order.notes || '')) {
        updateData.notes = editedNotes || null;
      }

      if (Object.keys(updateData).length === 0) {
        toast('No changes to save');
        setIsEditing(false);
        return;
      }

      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order details');
      }

      const result = await response.json();
      
      // Refresh order data
      await fetchOrder();
      
      // Notify parent to refresh orders list
      if (onStatusUpdate) {
        onStatusUpdate();
      }

      setIsEditing(false);
      toast.success('Order details updated successfully. Customer has been notified via email.');
    } catch (error: any) {
      console.error('Error updating order details:', error);
      toast.error(error.message || 'Failed to update order details');
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleCancelEdit = () => {
    if (order) {
      setEditedShippingFee(order.shipping_fee?.toString() || '0');
      setEditedNotes(order.notes || '');
    }
    setIsEditing(false);
  };

  const handleDownloadPDF = async () => {
    if (!order || downloadingPDF) return;

    try {
      setDownloadingPDF(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/pdf`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'Pending' },
      processing: { variant: 'info' as const, label: 'Processing' },
      shipped: { variant: 'info' as const, label: 'Shipped' },
      delivered: { variant: 'success' as const, label: 'Delivered' },
      cancelled: { variant: 'error' as const, label: 'Cancelled' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'PENDING' },
      paid: { variant: 'success' as const, label: 'PAID' },
      failed: { variant: 'error' as const, label: 'FAILED' },
      refunded: { variant: 'info' as const, label: 'REFUNDED' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Order Details</h2>
            {order && (
              <p className="text-sm text-[#3A3A3A] mt-1">Order #{order.order_number}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00afef]"></div>
              <span className="ml-3 text-[#3A3A3A]">Loading order details...</span>
            </div>
          ) : !order ? (
            <div className="text-center py-12 text-[#3A3A3A]">Order not found</div>
          ) : (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={18} className="text-[#00afef]" />
                    <h3 className="font-semibold text-[#1A1A1A]">Customer</h3>
                  </div>
                  <p className="text-sm text-[#1A1A1A] font-medium">{order.customer_name}</p>
                  <p className="text-xs text-[#3A3A3A] mt-1">{order.customer_email}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-[#00afef]" />
                    <h3 className="font-semibold text-[#1A1A1A]">Order Date</h3>
                  </div>
                  <p className="text-sm text-[#1A1A1A]">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={18} className="text-[#00afef]" />
                    <h3 className="font-semibold text-[#1A1A1A]">Status</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {updatingStatus ? (
                      <div className="ml-2 flex items-center gap-1 text-xs text-[#3A3A3A]">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00afef]"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#00afef] ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updatingStatus || isEditing || order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={18} className="text-[#00afef]" />
                    <h3 className="font-semibold text-[#1A1A1A]">Payment</h3>
                  </div>
                  <div className="space-y-1">
                    {getPaymentStatusBadge(order.payment_status)}
                    <p className="text-xs text-[#3A3A3A] mt-1 capitalize">{order.payment_method}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-[#00afef]" />
                    <h3 className="font-semibold text-[#1A1A1A]">Shipping Address</h3>
                  </div>
                  <div className="text-sm text-[#1A1A1A]">
                    {order.shipping_address.full_name && <p>{order.shipping_address.full_name}</p>}
                    {order.shipping_address.street_address && <p>{order.shipping_address.street_address}</p>}
                    {order.shipping_address.city && (
                      <p>
                        {order.shipping_address.city}
                        {order.shipping_address.region && `, ${order.shipping_address.region}`}
                        {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                      </p>
                    )}
                    {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                    {order.shipping_address.phone && <p className="mt-2">Phone: {order.shipping_address.phone}</p>}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-4">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-[#1A1A1A]">Product</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-[#1A1A1A]">Quantity</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-[#1A1A1A]">Price</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-[#1A1A1A]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => {
                          const itemVariants = formattedVariants[item.id] || [];
                          const isFlashDeal = (item as any).is_flash_deal;
                          
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 flex-shrink-0">
                                    {item.product_image ? (
                                      <Image
                                        src={item.product_image}
                                        alt={item.product_name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                        <Package size={20} className="text-gray-400" />
                                      </div>
                                    )}
                                    {isFlashDeal && (
                                      <div className="absolute -top-1 -right-1 bg-[#00afef] text-white rounded-full p-0.5">
                                        <Zap size={10} className="fill-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                      <p className="text-sm font-medium text-[#1A1A1A]">{item.product_name}</p>
                                      {isFlashDeal && (
                                        <Badge variant="error" size="sm">
                                          <Zap size={8} className="mr-1" />
                                          Deal
                                        </Badge>
                                      )}
                                    </div>
                                    {itemVariants.length > 0 && (
                                      <p className="text-xs text-[#3A3A3A] mt-1">
                                        {itemVariants.map(v => `${v.attribute_name}: ${v.option_label}`).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-[#3A3A3A]">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-right text-[#3A3A3A]">
                                GHS {(item.unit_price || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-[#1A1A1A]">
                                GHS {((item.total_price || (item as any).subtotal || (item.unit_price || 0) * (item.quantity || 0))).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[#3A3A3A]">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A1A1A] mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#3A3A3A]">Subtotal:</span>
                    <span className="font-medium text-[#1A1A1A]">GHS {order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#3A3A3A]">Discount:</span>
                      <span className="font-medium text-[#1A1A1A]">-GHS {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#3A3A3A]">Shipping:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#3A3A3A]">GHS</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editedShippingFee}
                          onChange={(e) => setEditedShippingFee(e.target.value)}
                          className="w-24 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#00afef] text-right"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <span className="font-medium text-[#1A1A1A]">GHS {order.shipping_fee?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#3A3A3A]">Tax:</span>
                      <span className="font-medium text-[#1A1A1A]">GHS {order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-[#1A1A1A]">Total:</span>
                    <span className="font-bold text-lg text-[#00afef]">
                      GHS {isEditing 
                        ? (Number(order.subtotal) - Number(order.discount || 0) + Number(order.tax || 0) + Number(editedShippingFee || 0)).toFixed(2)
                        : order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1A1A]">Order Notes</h3>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] resize-none"
                      rows={3}
                      placeholder="Add notes about this order..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updatingDetails}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveDetails}
                        isLoading={updatingDetails}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#3A3A3A]">{order.notes || 'No notes added'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose} disabled={updatingDetails || updatingStatus}>
            Close
          </Button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updatingDetails}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveDetails}
                  isLoading={updatingDetails}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={!order || loading || updatingStatus}
                >
                  Edit Order
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  isLoading={downloadingPDF}
                  disabled={!order || loading || updatingStatus}
                >
                  <Download size={18} className="mr-2" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

