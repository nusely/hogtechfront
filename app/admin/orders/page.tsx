'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Eye, 
  ChevronLeft,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { CSVExporter, OrderColumns } from '@/lib/csvExport';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { buildApiUrl } from '@/lib/api';
import { CreateOrderModal } from '@/components/admin/CreateOrderModal';
import { adminSettingsService } from '@/services/adminSettings.service';

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  user_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  items_count: number;
  notes?: string | null;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [allowManualOrders, setAllowManualOrders] = useState<boolean | null>(null);

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    let isMounted = true;

    const loadAutomationSettings = async () => {
      try {
        const settings = await adminSettingsService.getSettings({
          keys: ['automation_allow_admin_manual_orders'],
        });
        if (!isMounted) {
          return;
        }

        const rawValue = settings?.automation_allow_admin_manual_orders;
        const normalized = typeof rawValue === 'string' ? rawValue.toLowerCase() : String(rawValue ?? 'false');
        setAllowManualOrders(normalized === 'true');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load automation settings:', error);
        }
        if (isMounted) {
          setAllowManualOrders(false);
        }
      }
    };

    loadAutomationSettings();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (allowManualOrders === false) {
      setShowCreateOrderModal(false);
    }
  }, [allowManualOrders]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
    
    // Clear pending orders notification when orders page is opened
    const clearPendingOrdersNotification = async () => {
      try {
        // Mark pending orders notifications as read (if notifications table exists)
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('type', 'order')
            .eq('is_read', false);
        } catch (notifError) {
          // Notifications table might not exist - ignore
        }
      } catch (error) {
        // Ignore errors
      }
    };
    
    clearPendingOrdersNotification();
    
    // Debounce search (only when authenticated admin user is present)
    setCurrentPage(1);
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, searchQuery ? 300 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, statusFilter, searchQuery, router]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const fetchOrders = async () => {
    try {
      if (!isAuthenticated || !user) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Try backend API first (bypasses RLS)
      // Handle both cases: NEXT_PUBLIC_API_URL with or without /api
      const baseUrl = buildApiUrl('/api');
      const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.warn('No auth token available for admin orders fetch; skipping backend API call.');
          throw new Error('Missing authentication token');
        }

        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        const url = `${API_URL}/orders${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const data = result.data;
            
            // Process the data
            let formattedOrders = data.map((order: any) => {
              // Get customer name - try multiple sources
              let customerName = 'Unknown';
              let customerEmail = 'No email';
              
              if (order.user) {
                // Logged-in user - try multiple name sources
                const user = order.user as any;
                customerName = user.full_name || 
                              `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                              user.full_name ||
                              user.email?.split('@')[0] ||
                              'Unknown';
                customerEmail = user.email || 'No email';
              } else if (order.shipping_address) {
                // Guest order - get from shipping address
                const shipping = order.shipping_address as any;
                customerName = shipping.full_name || 
                              `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim() ||
                              shipping.full_name ||
                              shipping.email?.split('@')[0] ||
                              'Guest Customer';
                customerEmail = shipping.email || 'No email';
              } else if (order.delivery_address) {
                // Fallback to delivery_address
                const delivery = order.delivery_address as any;
                customerName = delivery.full_name || 
                              `${delivery.first_name || ''} ${delivery.last_name || ''}`.trim() ||
                              delivery.full_name ||
                              delivery.email?.split('@')[0] ||
                              'Guest Customer';
                customerEmail = delivery.email || 'No email';
              }
              
              // Normalize payment_status - ensure it's lowercase and has a default
              let paymentStatus = (order.payment_status || 'pending').toLowerCase();
              if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
                paymentStatus = 'pending'; // Default to pending if invalid value
              }
              
              return {
                id: order.id,
                order_number: order.order_number,
                user_name: customerName,
                user_email: customerEmail,
                total_amount: order.total,
                status: order.status || 'pending',
                payment_status: paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
                created_at: order.created_at,
                items_count: order.order_items?.length || 0,
                notes: order.notes || null,
              };
            });

            // Apply search filter client-side
            if (searchQuery) {
              const searchLower = searchQuery.toLowerCase();
              formattedOrders = formattedOrders.filter((order: any) =>
                order.order_number.toLowerCase().includes(searchLower) ||
                order.id.toLowerCase().includes(searchLower) ||
                order.user_name.toLowerCase().includes(searchLower) ||
                order.user_email.toLowerCase().includes(searchLower)
              );
            }

            setOrders(formattedOrders);
            return; // Success - exit early
          }
        }
      } catch (apiError: any) {
        if (apiError?.message === 'Missing authentication token') {
          console.warn('Skipped backend admin orders fetch due to missing auth token.');
          setOrders([]);
          setIsLoading(false);
          return;
        }

        console.warn('Backend API failed, trying Supabase:', apiError);
        // Fall through to Supabase fallback
      }

      // Fallback: Try Supabase directly (may have RLS restrictions)
      // Note: full_name may not exist yet, so we only query existing columns
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:users!orders_user_id_fkey(id, first_name, last_name, full_name, email),
          order_items(*)
        `);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      let formattedOrders = data?.map(order => {
        // Get customer name - try multiple sources
        let customerName = 'Unknown';
        let customerEmail = 'No email';
        
        if (order.user) {
          // Logged-in user - try multiple name sources
          const user = order.user as any;
          customerName = user.full_name || 
                        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                        user.full_name ||
                        user.email?.split('@')[0] ||
                        'Unknown';
          customerEmail = user.email || 'No email';
        } else if (order.shipping_address) {
          // Guest order - get from shipping address
          const shipping = order.shipping_address as any;
          customerName = shipping.full_name || 
                        `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim() ||
                        shipping.full_name ||
                        shipping.email?.split('@')[0] ||
                        'Guest Customer';
          customerEmail = shipping.email || 'No email';
        } else if (order.delivery_address) {
          // Fallback to delivery_address
          const delivery = order.delivery_address as any;
          customerName = delivery.full_name || 
                        `${delivery.first_name || ''} ${delivery.last_name || ''}`.trim() ||
                        delivery.full_name ||
                        delivery.email?.split('@')[0] ||
                        'Guest Customer';
          customerEmail = delivery.email || 'No email';
        }
        
        // Normalize payment_status - ensure it's lowercase and has a default
        let paymentStatus = (order.payment_status || 'pending').toLowerCase();
        if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
          paymentStatus = 'pending'; // Default to pending if invalid value
        }
        
        // Log payment_status for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Order payment_status:', {
            order_number: order.order_number,
            raw_payment_status: order.payment_status,
            normalized_payment_status: paymentStatus,
            payment_status_type: typeof order.payment_status,
          });
        }
        
        return {
          id: order.id,
          order_number: order.order_number,
          user_name: customerName,
          user_email: customerEmail,
          total_amount: order.total,
          status: order.status || 'pending',
          payment_status: paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
          created_at: order.created_at,
          items_count: order.order_items?.length || 0,
          notes: order.notes || null,
        };
      }) || [];

      // Apply search filter client-side
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        formattedOrders = formattedOrders.filter(order =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.user_name.toLowerCase().includes(searchLower) ||
          order.user_email.toLowerCase().includes(searchLower)
        );
      }

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', {
        error,
        message: error?.message || 'Unknown error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack,
        name: error?.name,
        fullError: JSON.stringify(error, null, 2),
      });
      
      // Provide more specific error message
      let errorMessage = 'Failed to fetch orders';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === 'PGRST301' || error?.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please check if you have admin access.';
      } else if (error?.message?.includes('policy') || error?.code === '42501') {
        errorMessage = 'Access denied by security policy. Please contact support.';
      } else if (error?.code) {
        errorMessage = `Error ${error.code}: ${error.message || 'Failed to fetch orders'}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      // Update order status via backend API (handles emails automatically)
      const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Order status updated and email sent!');
          fetchOrders(); // Refresh orders
        } else {
          throw new Error(result.message || 'Failed to update order status');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      // Update payment status via backend API
      const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          payment_status: newPaymentStatus,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Payment status updated!');
          fetchOrders(); // Refresh orders
        } else {
          throw new Error(result.message || 'Failed to update payment status');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update payment status');
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (paginatedOrders.length === 0) {
      return;
    }

    const pageIds = paginatedOrders.map((order) => order.id);
    const allSelectedOnPage = pageIds.every((id) => selectedOrders.has(id));

    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    try {
      const updatePromises = Array.from(selectedOrders).map(orderId =>
        updateOrderStatus(orderId, newStatus)
      );
      
      await Promise.all(updatePromises);
      const count = selectedOrders.size;
      setSelectedOrders(new Set());
      setIsSelectMode(false);
      toast.success(`Updated ${count} order(s)!`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast.error('Failed to update some orders');
    }
  };

  const bulkUpdatePaymentStatus = async (newPaymentStatus: string) => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    try {
      const updatePromises = Array.from(selectedOrders).map(orderId =>
        updatePaymentStatus(orderId, newPaymentStatus)
      );
      
      await Promise.all(updatePromises);
      const count = selectedOrders.size;
      setSelectedOrders(new Set());
      setIsSelectMode(false);
      toast.success(`Updated payment status for ${count} order(s)!`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
      toast.error('Failed to update some orders');
    }
  };

  const downloadOrderPDF = async (orderId: string, orderNumber: string) => {
    try {
      const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
      const response = await fetch(`${buildApiUrl('/api/orders')}/${orderId}/pdf`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
      processing: { variant: 'info' as const, icon: Package, label: 'Processing' },
      shipped: { variant: 'info' as const, icon: Truck, label: 'Shipped' },
      delivered: { variant: 'success' as const, icon: CheckCircle, label: 'Delivered' },
      cancelled: { variant: 'error' as const, icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    const statusConfig = {
      pending: 'warning' as const,
      paid: 'success' as const,
      failed: 'error' as const,
      refunded: 'info' as const,
    };

    return <Badge variant={statusConfig[status]}>{status.toUpperCase()}</Badge>;
  };

  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      order_number: order.order_number,
      customer_name: order.user_name,
      customer_email: order.user_email,
      total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) || 0 : (order.total_amount || 0),
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
    }));
    
    CSVExporter.export(exportData, OrderColumns, 'orders');
    toast.success('Orders exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft size={20} />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Orders</h1>
                <p className="text-sm text-[#3A3A3A] mt-1">Manage and track customer orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {allowManualOrders !== false && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => setShowCreateOrderModal(true)}
                >
                  Create Order
                </Button>
              )}
              {isSelectMode && selectedOrders.size > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => bulkUpdateStatus(e.target.value)}
                    className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
                    defaultValue=""
                  >
                    <option value="" disabled>Bulk Update Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    onChange={(e) => bulkUpdatePaymentStatus(e.target.value)}
                    className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
                    defaultValue=""
                  >
                    <option value="" disabled>Bulk Update Payment</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <span className="text-sm text-[#3A3A3A]">
                    {selectedOrders.size} selected
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedOrders(new Set());
                }}
              >
                {isSelectMode ? 'Cancel' : 'Select'}
              </Button>
              <Button 
                variant="outline" 
                icon={<Download size={18} />}
                onClick={handleExportOrders}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {allowManualOrders === false && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Manual order creation is currently disabled in settings. Re-enable “Allow Admin-created Orders” under Automation to restore the button.
          </div>
        )}
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3A3A3A]" size={20} />
                <input
                  type="text"
                  placeholder="Search by order number, order ID, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
                <option>This month</option>
                <option>All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00afef]"></div>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-[#00afef]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Orders Yet</h3>
              <p className="text-[#3A3A3A] mb-6">
                Orders will appear here once customers start purchasing
              </p>
            </div>
          ) : (
            /* Orders Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {isSelectMode && (
                      <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">
                        <input
                          type="checkbox"
                          checked={
                            paginatedOrders.length > 0 &&
                            paginatedOrders.every((order) => selectedOrders.has(order.id))
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-[#00afef] focus:ring-[#00afef]"
                        />
                      </th>
                    )}
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Order #</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Payment</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-blue-50' : ''}`}>
                      {isSelectMode && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#00afef] focus:ring-[#00afef]"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-[#00afef] font-semibold">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-sm text-[#1A1A1A]">{order.user_name}</p>
                          <p className="text-xs text-[#3A3A3A]">{order.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3A3A3A]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3A3A3A]">
                        {order.items_count} items
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#1A1A1A]">
                          GHS {order.total_amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Payment status dropdown - always editable */}
                        <select
                          value={(order.payment_status || 'pending').toLowerCase()}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            console.log('Payment status changed:', { orderId: order.id, order_number: order.order_number, oldStatus: order.payment_status, newStatus });
                            updatePaymentStatus(order.id, newStatus);
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#00afef] bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('View button clicked for order:', order.id, order.order_number);
                              if (order.id) {
                                setSelectedOrderId(order.id);
                                setIsModalOpen(true);
                                console.log('Modal should open with orderId:', order.id);
                              } else {
                                console.error('Order ID is missing:', order);
                                toast.error('Order ID is missing');
                              }
                            }}
                          >
                            <Eye size={16} />
                            View
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadOrderPDF(order.id, order.order_number)}
                            title="Download PDF"
                          >
                            <FileText size={16} />
                          </Button>
                          
                          {/* Status Update Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#00afef]"
                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {orders.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg mt-4 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-[#3A3A3A]">
              Showing{' '}
              <span className="font-semibold">
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, orders.length)}
              </span>{' '}
              of <span className="font-semibold">{orders.length}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-[#1A1A1A]">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen && !!selectedOrderId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId || ''}
        onStatusUpdate={() => {
          fetchOrders();
        }}
      />

      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onCreated={() => {
          setShowCreateOrderModal(false);
          setCurrentPage(1);
          fetchOrders();
        }}
        adminEmail={user?.email || ''}
      />
    </div>
  );
}


