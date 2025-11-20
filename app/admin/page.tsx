'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Heart,
  AlertCircle,
  Eye,
  CreditCard,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { settingsService as clientSettingsService } from '@/lib/settings.service';
import { buildApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/helpers';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange?: number; // Average Order Value change
}

interface RecentTransaction {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    averageOrderValue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [insights, setInsights] = useState({
    wishlistUsers: 0,
    abandonedCarts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(3);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<Array<any>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token || null;

      let threshold = 3;
      try {
        const thresholdSetting = await clientSettingsService.getSetting('inventory_low_stock_threshold');
        const parsed = parseInt(thresholdSetting || '', 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          threshold = parsed;
        }
      } catch (error) {
        // Ignore and use default
      }
      setLowStockThreshold(threshold);

      // Calculate date ranges for comparison
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch total revenue from transactions table (source of truth)
      // Try transactions first, fallback to paid orders if transactions don't exist
      let totalRevenue = 0;
      let paidOrders: any[] = [];
      
      try {
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount, created_at, payment_status')
          .in('payment_status', ['paid', 'success']);

        if (!transactionsError && transactions && transactions.length > 0) {
          // Use transactions as source of truth for revenue
          totalRevenue = transactions.reduce((sum, tx) => sum + (parseFloat(String(tx.amount)) || 0), 0);
          console.log('Revenue calculated from transactions:', totalRevenue, 'transactions:', transactions.length);
        } else {
          // Fallback to paid orders if transactions table is empty or doesn't exist
          const { data: paidOrdersData, error: revenueError } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('payment_status', 'paid');

          if (revenueError) {
            console.error('Error fetching paid orders:', revenueError);
          } else {
            paidOrders = paidOrdersData || [];
            totalRevenue = paidOrders.reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0);
            console.log('Revenue calculated from paid orders:', totalRevenue, 'orders:', paidOrders.length);
          }
        }
      } catch (error) {
        console.error('Error calculating revenue:', error);
        // Continue with 0 revenue
      }
      
      // Calculate current month vs last month revenue
      // Try transactions first, fallback to orders
      let currentMonthRevenue = 0;
      let lastMonthRevenue = 0;
      
      try {
        const { data: allTransactions, error: txError } = await supabase
          .from('transactions')
          .select('amount, created_at, payment_status')
          .in('payment_status', ['paid', 'success']);

        if (!txError && allTransactions && allTransactions.length > 0) {
          currentMonthRevenue = allTransactions
            .filter(tx => {
              const txDate = new Date(tx.created_at);
              return txDate >= currentMonthStart;
            })
            .reduce((sum, tx) => sum + (parseFloat(String(tx.amount)) || 0), 0);

          lastMonthRevenue = allTransactions
            .filter(tx => {
              const txDate = new Date(tx.created_at);
              return txDate >= lastMonthStart && txDate <= lastMonthEnd;
            })
            .reduce((sum, tx) => sum + (parseFloat(String(tx.amount)) || 0), 0);
        } else {
          // Fallback to orders
          if (paidOrders.length === 0) {
            const { data: paidOrdersData } = await supabase
              .from('orders')
              .select('total, created_at')
              .eq('payment_status', 'paid');
            paidOrders = paidOrdersData || [];
          }
          
          currentMonthRevenue = paidOrders
            .filter(order => {
              const orderDate = new Date(order.created_at);
              return orderDate >= currentMonthStart;
            })
            .reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0);

          lastMonthRevenue = paidOrders
            .filter(order => {
              const orderDate = new Date(order.created_at);
              return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
            })
            .reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0);
        }
      } catch (error) {
        console.error('Error calculating revenue change:', error);
      }

      const revenueChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Fetch total orders - combine count and dates in one query
      const { data: allOrders, error: allOrdersError, count: totalOrdersCount } = await supabase
        .from('orders')
        .select('created_at', { count: 'exact' });

      if (allOrdersError) {
        console.error('Error fetching orders:', allOrdersError);
        // Continue with empty array - don't break the whole dashboard
      }

      const currentMonthOrders = allOrders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= currentMonthStart;
      }).length || 0;

      const lastMonthOrders = allOrders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      }).length || 0;

      const ordersChange = lastMonthOrders > 0 
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
        : 0;

      // Fetch total customers - try multiple approaches
      let totalCustomersCount: number | null = null;
      let customersError: any = null;
      let allCustomers: any[] = [];
      
      // First, try to get count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (!countError) {
        totalCustomersCount = count;
      } else {
        customersError = countError;
        console.error('Error fetching customer count:', {
          error: countError,
          message: countError.message,
          code: countError.code,
          details: countError.details,
          hint: countError.hint,
        });
      }

      // Also try to fetch actual data (might work even if count doesn't due to RLS)
      const { data: customersData, error: dataError } = await supabase
        .from('users')
        .select('id, created_at, role, email')
        .eq('role', 'customer');

      if (!dataError && customersData) {
        allCustomers = customersData;
        // If we got data but count failed, use data length
        if (totalCustomersCount === null && allCustomers.length > 0) {
          totalCustomersCount = allCustomers.length;
        }
      } else if (dataError) {
        console.error('Error fetching customer data:', {
          error: dataError,
          message: dataError.message,
          code: dataError.code,
          details: dataError.details,
          hint: dataError.hint,
        });
        // If both failed, try fetching all users and filtering client-side
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, created_at, role, email');
        
        if (!allUsersError && allUsers) {
          // Filter client-side
          allCustomers = allUsers.filter((u: any) => u.role === 'customer');
          if (allCustomers.length > 0) {
            totalCustomersCount = allCustomers.length;
          }
        }
      }

      const currentMonthCustomers = allCustomers?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= currentMonthStart;
      }).length || 0;

      const lastMonthCustomers = allCustomers?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= lastMonthStart && userDate <= lastMonthEnd;
      }).length || 0;

      const customersChange = lastMonthCustomers > 0 
        ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 
        : 0;

      // Fetch total products
      const { count: totalProductsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Calculate average order value from paid orders only
      // Get count of paid orders for accurate AOV calculation
      let paidOrdersCount = 0;
      try {
        const { count, error: paidCountError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'paid');
        
        if (!paidCountError && count !== null) {
          paidOrdersCount = count;
        } else {
          // Fallback: use transactions count if available
          const { count: txCount, error: txCountError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .in('payment_status', ['paid', 'success']);
          
          if (!txCountError && txCount !== null) {
            paidOrdersCount = txCount;
          }
        }
      } catch (error) {
        console.error('Error calculating paid orders count:', error);
      }

      const averageOrderValue = paidOrdersCount > 0 
        ? totalRevenue / paidOrdersCount 
        : 0;
      
      // Calculate AOV change (current month vs last month)
      // Use paid orders count for accurate AOV calculation
      let currentMonthPaidOrders = 0;
      let lastMonthPaidOrders = 0;
      
      try {
        // Get paid orders for current month
        const { data: currentMonthPaidData } = await supabase
          .from('orders')
          .select('id, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', currentMonthStart.toISOString());
        
        currentMonthPaidOrders = currentMonthPaidData?.length || 0;
        
        // Get paid orders for last month
        const { data: lastMonthPaidData } = await supabase
          .from('orders')
          .select('id, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());
        
        lastMonthPaidOrders = lastMonthPaidData?.length || 0;
      } catch (error) {
        console.error('Error calculating paid orders for AOV:', error);
      }
      
      const currentMonthAOV = currentMonthPaidOrders > 0 
        ? currentMonthRevenue / currentMonthPaidOrders 
        : 0;
      
      const lastMonthAOV = lastMonthPaidOrders > 0 
        ? lastMonthRevenue / lastMonthPaidOrders 
        : 0;
      
      const aovChange = lastMonthAOV > 0 
        ? ((currentMonthAOV - lastMonthAOV) / lastMonthAOV) * 100 
        : 0;

      // Update stats
      // Use actual count from allCustomers array if available, otherwise use the count query result
      // Priority: allCustomers.length > totalCustomersCount > 0
      let actualCustomerCount = 0;
      if (allCustomers && allCustomers.length > 0) {
        // Use actual array length if we successfully fetched customers
        actualCustomerCount = allCustomers.length;
      } else if (totalCustomersCount !== null && totalCustomersCount !== undefined && totalCustomersCount > 0) {
        // Use count query result if available
        actualCustomerCount = totalCustomersCount;
      }
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Customer count calculation:', {
          allCustomersLength: allCustomers?.length,
          totalCustomersCount,
          customersError: customersError?.message,
          dataError: dataError?.message,
          actualCustomerCount,
          sampleCustomers: allCustomers?.slice(0, 2).map((c: any) => ({ id: c.id, email: c.email, role: c.role })),
        });
      }
      
      setStats({
        totalRevenue,
        totalOrders: totalOrdersCount || 0,
        totalCustomers: actualCustomerCount,
        totalProducts: totalProductsCount || 0,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        ordersChange: parseFloat(ordersChange.toFixed(1)),
        customersChange: parseFloat(customersChange.toFixed(1)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        aovChange: parseFloat(aovChange.toFixed(1)), // Store AOV change for use in card
      });

      // Fetch recent transactions (recent orders) - simplified query without join
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, total, status, payment_status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersError) {
        console.error('Error fetching recent orders:', recentOrdersError);
        setRecentTransactions([]);
      } else {
        // Fetch user names separately if needed
        const userIds = [...new Set((recentOrders || []).map(o => o.user_id).filter(Boolean))];
        let usersMap: { [key: string]: any } = {};
        
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .in('id', userIds);
          
          if (!usersError && users) {
            usersMap = users.reduce((acc, u) => {
              acc[u.id] = u;
              return acc;
            }, {} as any);
          }
        }

      const formattedTransactions: RecentTransaction[] = (recentOrders || []).map(order => {
          const user = usersMap[order.user_id] || null;
          const userName = user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'
          : 'Guest';
        
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let dateString = '';
        if (diffHours < 1) dateString = 'Just now';
        else if (diffHours < 24) dateString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else if (diffDays === 1) dateString = '1 day ago';
        else dateString = `${diffDays} days ago`;

        return {
          id: order.id,
          customer: userName,
          amount: parseFloat(order.total) || 0,
          status: order.payment_status === 'paid' ? 'completed' : order.payment_status === 'pending' ? 'pending' : 'failed',
          date: dateString,
        };
      });

      setRecentTransactions(formattedTransactions);
      }

      // Fetch top products by revenue - use backend API first to bypass RLS
      let orderItems: any[] = [];
      
      // Try backend API first (bypasses RLS)
      try {
        if (!authToken) {
          throw new Error('Missing authentication token');
        }

        const response = await fetch(buildApiUrl('/api/orders'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Only get PAID orders for top products calculation
            // Pending orders don't count until they're paid
            const paidOrders = (result.data || []).filter((order: any) => 
              order.payment_status === 'paid' || order.payment_status === 'success'
            );

            console.log('📊 Top Products: Using', paidOrders.length, 'paid orders (excluding pending)');

            // Extract order items from paid orders only
            paidOrders.forEach((order: any) => {
              if (order.order_items && Array.isArray(order.order_items)) {
                orderItems.push(...order.order_items);
              }
            });

            // If we got items via API, skip Supabase query
            if (orderItems.length > 0) {
              console.log('Fetched order items via API:', orderItems.length);
            }
          }
        }
      } catch (apiError: any) {
        if (apiError?.message === 'Missing authentication token') {
          console.warn('Skipping backend dashboard orders fetch: no auth token available yet.');
        } else {
          console.warn('Backend API failed, trying Supabase:', apiError);
        }
      }

      // Fallback to Supabase if API didn't return data
      if (orderItems.length === 0) {
        // Try transactions first (source of truth for revenue)
        // Only count PAID transactions for top products
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            order:orders!transactions_order_id_fkey(id, order_items(product_name, quantity, unit_price))
          `)
          .in('payment_status', ['paid', 'success'])
          .limit(1000); // Limit to prevent huge queries

        if (!transactionsError && transactions && transactions.length > 0) {
          // Extract order items from transactions
          transactions.forEach((tx: any) => {
            if (tx.order?.order_items && Array.isArray(tx.order.order_items)) {
              orderItems.push(...tx.order.order_items);
            }
          });
        } else {
          // Fallback to orders if transactions fail
          if (paidOrders && paidOrders.length > 0) {
            const paidOrderIdsArray = paidOrders.map((o: any) => o.id).filter(Boolean);
            
            if (paidOrderIdsArray.length > 0) {
              const { data: items, error: orderItemsError } = await supabase
                .from('order_items')
                .select('product_name, quantity, unit_price')
                .in('order_id', paidOrderIdsArray)
                .limit(1000); // Limit to prevent huge queries

              if (orderItemsError) {
                console.error('Error fetching order items:', orderItemsError);
              } else {
                orderItems = items || [];
              }
            }
          }
        }
      }

      // Calculate product revenue
      const productRevenue: { [key: string]: { sales: number; revenue: number } } = {};
      
      orderItems.forEach(item => {
        const productName = item.product_name;
        if (!productName) return; // Skip items without product name
        if (!productRevenue[productName]) {
          productRevenue[productName] = { sales: 0, revenue: 0 };
        }
        productRevenue[productName].sales += item.quantity || 0;
        productRevenue[productName].revenue += (item.quantity || 0) * (parseFloat(item.unit_price) || 0);
      });

      const topProductsList: TopProduct[] = Object.entries(productRevenue)
        .map(([name, data]) => ({
          name,
          sales: data.sales,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      setTopProducts(topProductsList);

      // Fetch insights - with error handling to prevent breaking the dashboard
      // Wishlist users count
      let uniqueWishlistUsers = 0;
      try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('user_id', { count: 'exact' });

        if (!wishlistError && wishlistData) {
          uniqueWishlistUsers = new Set(wishlistData.map(w => w.user_id).filter(Boolean)).size;
        }
      } catch (error) {
        console.error('Error fetching wishlist users:', error);
      }

      // Abandoned carts - users who added to cart but have been inactive for 12h+
      let abandonedCount = 0;
      try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { data: abandonedItems, error: abandonedError } = await supabase
          .from('cart_items')
          .select(`
            id,
            user_id,
            quantity,
            created_at,
            updated_at,
            product:products(id),
            user:users!cart_items_user_id_fkey(id, email)
          `)
          .lt('updated_at', twelveHoursAgo)
          .order('updated_at', { ascending: false });

        if (abandonedError) {
          throw abandonedError;
        }

        const uniqueCartKeys = new Set<string>();

        type CartItemRow = {
          id: string;
          user_id: string | null;
          quantity: number | null;
          product: { id: string } | Array<{ id: string }> | null;
          user: { id?: string | null; email?: string | null } | Array<{ id?: string | null; email?: string | null }> | null;
        };

        const rows: CartItemRow[] = Array.isArray(abandonedItems) ? (abandonedItems as CartItemRow[]) : [];

        rows
          .filter((item) => {
            const quantity = item.quantity ?? 0;
            const productData = item.product;
            const hasProduct = Array.isArray(productData)
              ? productData.length > 0
              : Boolean(productData);
            return quantity > 0 && hasProduct;
          })
          .forEach((item) => {
            const userRecord = Array.isArray(item.user) ? item.user[0] : item.user;
            const email = typeof userRecord?.email === 'string' && userRecord.email.trim().length > 0
              ? userRecord.email.trim().toLowerCase()
              : null;
            const key = email || item.user_id || item.id;
            uniqueCartKeys.add(String(key));
          });

        abandonedCount = uniqueCartKeys.size;
      } catch (error) {
        console.error('Error fetching abandoned carts:', error);
      }

      // Low stock products
      let lowStockCount = 0;
      try {
        const { count, error: lowStockError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', threshold)
        .eq('in_stock', true);

        if (!lowStockError) {
          lowStockCount = count || 0;
        }
      } catch (error) {
        console.error('Error fetching low stock products:', error);
      }

      // Pending orders - check both payment_status and status
      let pendingOrdersCount = 0;
      try {
        // First try: orders with pending payment_status
        const { count: pendingPaymentCount, error: pendingPaymentError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'pending');

        if (!pendingPaymentError && pendingPaymentCount !== null) {
          pendingOrdersCount = pendingPaymentCount;
        }

        // Also check orders with status = 'pending' (in case payment_status is different)
        const { count: pendingStatusCount, error: pendingStatusError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .neq('payment_status', 'paid'); // Exclude already paid orders

        if (!pendingStatusError && pendingStatusCount !== null) {
          // Use the higher count (might have orders with status=pending but payment_status=paid)
          pendingOrdersCount = Math.max(pendingOrdersCount, pendingStatusCount);
        }

        // If both queries failed, try getting all orders and filtering client-side
        if (pendingPaymentError && pendingStatusError) {
          const { data: allOrdersData, error: allOrdersError } = await supabase
            .from('orders')
            .select('id, payment_status, status');

          if (!allOrdersError && allOrdersData) {
            pendingOrdersCount = allOrdersData.filter(
              (order: any) => 
                order.payment_status === 'pending' || 
                (order.status === 'pending' && order.payment_status !== 'paid')
            ).length;
          }
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }

      setInsights({
        wishlistUsers: uniqueWishlistUsers,
        abandonedCarts: abandonedCount || 0,
        lowStockProducts: lowStockCount || 0,
        pendingOrders: pendingOrdersCount || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `GHS ${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Avg Order Value',
      value: `GHS ${stats.averageOrderValue.toFixed(2)}`,
      change: stats.aovChange || 0,
      icon: CreditCard,
      color: 'bg-[#00afef]',
      bgColor: 'bg-blue-50',
      textColor: 'text-[#163b86]',
    },
  ];

  const handleOpenLowStockModal = async () => {
    setIsLowStockModalOpen(true);
    setIsLoadingLowStock(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(buildApiUrl('/api/products/low-stock'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch low stock products');
      }

      const result = await response.json();
      setLowStockThreshold(result.data?.threshold ?? lowStockThreshold);
      setLowStockProducts(result.data?.products || []);
    } catch (error) {
      console.error('Error fetching low stock products list:', error);
      toast.error('Failed to load low stock products');
      setLowStockProducts([]);
    } finally {
      setIsLoadingLowStock(false);
    }
  };

  const insightCards: Array<{
    title: string;
    count: number;
    subtitle: string;
    icon: typeof Heart;
    color: string;
    bgColor: string;
    link?: string;
    onClick?: () => void;
  }> = [
    {
      title: 'Wishlist But No Purchase',
      count: insights.wishlistUsers,
      subtitle: 'Users with items in wishlist',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      link: '/admin/wishlist-insights',
    },
    {
      title: 'Abandoned Carts',
      count: insights.abandonedCarts,
      subtitle: 'Carts not completed',
      icon: ShoppingCart,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/admin/cart-analytics',
    },
    {
      title: 'Low Stock Products',
      count: insights.lowStockProducts,
      subtitle: 'Products below threshold',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: handleOpenLowStockModal,
    },
    {
      title: 'Pending Orders',
      count: insights.pendingOrders,
      subtitle: 'Awaiting processing',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/orders?status=pending',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00afef] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={card.textColor} size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  card.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {Math.abs(card.change)}%
              </div>
            </div>
            <p className="text-[#3A3A3A] text-sm mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{card.value}</p>
            <p className="text-xs text-[#3A3A3A] mt-2">vs last month</p>
          </div>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insightCards.map((card) => {
          const CardInner = (
            <>
              <div className="flex items-start justify-between mb-3">
                <card.icon className={card.color} size={32} />
                <Eye size={16} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A] mb-1">{card.count}</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{card.title}</p>
              <p className="text-xs text-[#3A3A3A]">{card.subtitle}</p>
            </>
          );

          if (card.onClick) {
            return (
              <button
                key={card.title}
                onClick={card.onClick}
                className={`${card.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-[#00afef] transition-all text-left cursor-pointer`}
              >
                {CardInner}
              </button>
            );
          }

          return (
            <Link
              key={card.title}
              href={card.link ?? '#'}
              className={`${card.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-[#00afef] transition-all cursor-pointer`}
            >
              {CardInner}
            </Link>
          );
        })}
      </div>

      {/* Recent Transactions & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Recent Transactions</h2>
            <a
              href="/admin/transactions"
              className="text-sm text-[#00afef] hover:underline font-medium"
            >
              View All →
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#1A1A1A]">{transaction.customer}</p>
                  <p className="font-bold text-[#1A1A1A]">
                    GHS {transaction.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.status}
                  </span>
                  <span className="text-xs text-[#3A3A3A]">{transaction.date}</span>
                </div>
              </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#3A3A3A]">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Top Products</h2>
            <a
              href="/admin/products"
              className="text-sm text-[#00afef] hover:underline font-medium"
            >
              View All →
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => {
                const maxSales = Math.max(...topProducts.map(p => p.sales), 1);
                return (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A] mb-1">{product.name}</p>
                    <p className="text-sm text-[#3A3A3A]">{product.sales} units sold</p>
                  </div>
                  <p className="font-bold text-[#00afef]">
                    GHS {product.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-[#00afef] h-2 rounded-full"
                        style={{ width: `${(product.sales / maxSales) * 100}%` }}
                  ></div>
                </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-[#3A3A3A]">
                No products sold yet
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        title="Low Stock Products"
        size="xl"
      >
        <LowStockModalContent
          isLoading={isLoadingLowStock}
          products={lowStockProducts}
          threshold={lowStockThreshold}
        />
      </Modal>
    </div>
  );
}

const LowStockModalContent = ({
  isLoading,
  products,
  threshold,
}: {
  isLoading: boolean;
  products: Array<any>;
  threshold: number;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00afef] mx-auto mb-3"></div>
          <p className="text-sm text-[#3A3A3A]">Fetching low stock products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center text-[#3A3A3A]">
        <p className="text-base font-medium mb-2">No low stock products 🎉</p>
        <p className="text-sm">All products are above the current threshold ({threshold}).</p>
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200">
      {products.map((product) => {
        const imageUrl = product.thumbnail || (product.images && product.images[0]) || '/placeholders/placeholder-product.webp';
        // Backend returns 'price' field, not 'original_price'
        const price = product.discount_price ?? product.price ?? 0;

        return (
          <div key={product.id} className="flex items-start gap-4 py-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1A1A1A] truncate" title={product.name}>
                  {product.name}
                </p>
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  Stock: {product.stock_quantity ?? 0}
                </span>
              </div>
              {product.category?.name && (
                <p className="text-xs text-[#3A3A3A] mt-1">Category: {product.category.name}</p>
              )}
              <div className="text-sm text-[#3A3A3A] mt-2 flex flex-wrap gap-4">
                <span>Price: {formatCurrency(price)}</span>
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>
            </div>
            <Link
              href={`/admin/products?productId=${product.id}`}
              className="text-sm font-medium text-[#00afef] hover:underline"
            >
              Manage
            </Link>
          </div>
        );
      })}
    </div>
  );
};
