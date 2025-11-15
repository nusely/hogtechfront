'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Heart, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  returningRate: number;
  avgLifetimeValue: number;
  topCustomers: Array<{ name: string; orders: number; spent: number; since: string }>;
  customerSegments: Array<{ segment: string; count: number; percentage: number }>;
}

interface SupabaseCustomerRecord {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  source?: string | null;
  created_at: string;
  user?:
    | {
        full_name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        created_at?: string | null;
      }
    | null;
}

export default function CustomersAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '90days'>('30days');
  const [customerData, setCustomerData] = useState<CustomerData>({
    totalCustomers: 0,
    newCustomers: 0,
    returningRate: 0,
    avgLifetimeValue: 0,
    topCustomers: [],
    customerSegments: [],
  });

  useEffect(() => {
    fetchCustomerData();
  }, [timeFilter]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate: Date;
      switch (timeFilter) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: customerRecords, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          user_id,
          full_name,
          email,
          source,
          created_at,
          user:users!customers_user_id_fkey(full_name, first_name, last_name, created_at)
        `);

      if (customersError) throw customersError;

      const customers: SupabaseCustomerRecord[] = Array.isArray(customerRecords)
        ? (customerRecords as SupabaseCustomerRecord[])
        : [];

      const totalCustomers = customers.length;
      const newCustomers = customers.filter((customer) => new Date(customer.created_at) >= startDate).length;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          created_at,
          customer_id,
          user_id,
          customer:customers!orders_customer_id_fkey(id, full_name, email, created_at),
          user:users!orders_user_id_fkey(full_name, first_name, last_name, created_at)
        `)
        .eq('payment_status', 'paid');

      if (ordersError) throw ordersError;

      const unwrap = <T,>(value: T | T[] | null | undefined): T | null => {
        if (!value) return null;
        if (Array.isArray(value)) {
          return value.length > 0 ? (value[0] as T) : null;
        }
        return value;
      };

      const findCustomerById = (id: string | null): SupabaseCustomerRecord | null => {
        if (!id) return null;
        return customers.find((customer) => customer.id === id) || null;
      };

      const resolveName = (
        joinedCustomer: any,
        fallbackCustomer: SupabaseCustomerRecord | null,
        joinedUser: any
      ) => {
        const candidates = [
          typeof joinedCustomer?.full_name === 'string' ? joinedCustomer.full_name : undefined,
          typeof fallbackCustomer?.full_name === 'string' ? fallbackCustomer.full_name : undefined,
          typeof joinedUser?.full_name === 'string' ? joinedUser.full_name : undefined,
          `${joinedUser?.first_name || ''} ${joinedUser?.last_name || ''}`.trim() || undefined,
        ];

        const name = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
        return name ? name.trim() : 'Guest Customer';
      };

      const resolveSinceDate = (
        joinedCustomer: any,
        fallbackCustomer: SupabaseCustomerRecord | null,
        joinedUser: any,
        orderCreatedAt: string
      ) => {
        const candidateDates = [
          joinedCustomer?.created_at,
          fallbackCustomer?.created_at,
          joinedUser?.created_at,
          orderCreatedAt,
        ].filter(Boolean);

        if (candidateDates.length === 0) {
          return orderCreatedAt;
        }

        return candidateDates.reduce((earliest, current) => {
          return new Date(current) < new Date(earliest) ? current : earliest;
        }, candidateDates[0]);
      };

      const customerSpending: Record<string, { name: string; orders: number; spent: number; since: string }> = {};

      orders?.forEach((order: any) => {
        const key: string | null = order.customer_id || order.user_id;
        if (!key) return;

        const joinedCustomer = unwrap(order.customer);
        const joinedUser = unwrap(order.user);
        const fallbackCustomer = order.customer_id ? findCustomerById(order.customer_id) : null;

        const customerName = resolveName(joinedCustomer, fallbackCustomer, joinedUser);
        const since = resolveSinceDate(joinedCustomer, fallbackCustomer, joinedUser, order.created_at);
        const amountRaw = typeof order.total === 'number' ? order.total : parseFloat(order.total ?? '0');
        const amount = Number.isFinite(amountRaw) ? amountRaw : 0;

        if (!customerSpending[key]) {
          customerSpending[key] = {
            name: customerName,
            orders: 0,
            spent: 0,
            since,
          };
        }

        customerSpending[key].orders += 1;
        customerSpending[key].spent += amount;
        if (new Date(since) < new Date(customerSpending[key].since)) {
          customerSpending[key].since = since;
        }
      });

      const topCustomers = Object.values(customerSpending)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

      const totalWithOrders = Object.keys(customerSpending).length;
      const customersWithoutOrders = Math.max(0, totalCustomers - totalWithOrders);

      const vipCount = Object.values(customerSpending).filter((c) => c.orders >= 10).length;
      const loyalCount = Object.values(customerSpending).filter((c) => c.orders >= 5 && c.orders < 10).length;
      const regularCount = Object.values(customerSpending).filter((c) => c.orders >= 2 && c.orders < 5).length;
      const newCount = Object.values(customerSpending).filter((c) => c.orders === 1).length;

      const customerSegments = [
        { segment: 'VIP (10+ orders)', count: vipCount },
        { segment: 'Loyal (5-9 orders)', count: loyalCount },
        { segment: 'Regular (2-4 orders)', count: regularCount },
        { segment: 'New (1 order)', count: newCount },
        { segment: 'No Orders Yet', count: customersWithoutOrders },
      ].map((segment) => ({
        segment: segment.segment,
        count: segment.count,
        percentage: totalCustomers > 0 ? parseFloat(((segment.count / totalCustomers) * 100).toFixed(1)) : 0,
      }));

      const customersWithMultipleOrders = Object.values(customerSpending).filter((c) => c.orders > 1).length;
      const returningRate = totalWithOrders > 0 ? (customersWithMultipleOrders / totalWithOrders) * 100 : 0;

      const totalSpent = Object.values(customerSpending).reduce((sum, customer) => sum + customer.spent, 0);
      const avgLifetimeValue = totalWithOrders > 0 ? totalSpent / totalWithOrders : 0;

      setCustomerData({
        totalCustomers,
        newCustomers,
        returningRate: parseFloat(returningRate.toFixed(1)),
        avgLifetimeValue: parseFloat(avgLifetimeValue.toFixed(2)),
        topCustomers,
        customerSegments,
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00afef] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading customer analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Customer Analytics</h1>
          <p className="text-sm text-[#3A3A3A] mt-1">
            Understand your customer base and behavior
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <Button variant="outline" icon={<Download size={18} />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-600" size={32} />
          </div>
          <p className="text-sm text-blue-700 mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-blue-900">{customerData.totalCustomers}</p>
          <p className="text-sm text-blue-700 mt-2">Registered users</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="text-green-600" size={32} />
          </div>
          <p className="text-sm text-green-700 mb-1">New Customers</p>
          <p className="text-3xl font-bold text-green-900">{customerData.newCustomers}</p>
          <p className="text-sm text-green-700 mt-2">This period</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-purple-600" size={32} />
          </div>
          <p className="text-sm text-purple-700 mb-1">Returning Rate</p>
          <p className="text-3xl font-bold text-purple-900">{customerData.returningRate}%</p>
          <p className="text-sm text-purple-700 mt-2">Customer retention</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="text-[#163b86]" size={32} />
          </div>
          <p className="text-sm text-[#163b86] mb-1">Avg. Lifetime Value</p>
          <p className="text-3xl font-bold text-[#163b86]">
            GHS {customerData.avgLifetimeValue}
          </p>
          <p className="text-sm text-[#163b86] mt-2">Per customer</p>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-6">Customer Segments</h2>
        <div className="space-y-4">
          {customerData.customerSegments.map((segment, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#1A1A1A]">{segment.segment}</span>
                <div className="text-right">
                  <span className="font-bold text-[#1A1A1A]">
                    {segment.count} customers
                  </span>
                  <span className="text-sm text-[#3A3A3A] ml-2">
                    ({segment.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#00afef] h-full rounded-full transition-all duration-500"
                  style={{ width: `${segment.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Top Customers (By Spending)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Customer Since
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customerData.topCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#1A1A1A]">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">{customer.name}</span>
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#3A3A3A]">{customer.orders} orders</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#00afef]">
                      GHS {customer.spent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#3A3A3A]">
                      {new Date(customer.since).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 p-6">
        <h3 className="font-bold text-purple-900 mb-3">💡 Customer Insights</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          {(() => {
            // Calculate first-time buyers (customers with 1 order or no orders)
            const firstTimeBuyersPercentage = customerData.totalCustomers > 0 
              ? ((customerData.customerSegments.find(s => s.segment === 'New (1 order)')?.count || 0) + 
                 (customerData.customerSegments.find(s => s.segment === 'No Orders Yet')?.count || 0)) / customerData.totalCustomers * 100
              : 0;

            // Get VIP percentage
            const vipSegment = customerData.customerSegments.find(s => s.segment === 'VIP (10+ orders)');
            const vipPercentage = vipSegment?.percentage || 0;

            return (
              <>
                <li>
                  ✓ {firstTimeBuyersPercentage >= 1 
                    ? `Nearly ${Math.round(firstTimeBuyersPercentage)}%` 
                    : firstTimeBuyersPercentage > 0 
                    ? `About ${firstTimeBuyersPercentage.toFixed(1)}%`
                    : 'A small percentage'} of customers are first-time buyers - focus on retention strategies
                </li>
                {vipPercentage > 0 && (
                  <li>
                    ✓ VIP customers ({vipPercentage.toFixed(1)}%) contribute significantly to revenue - reward them
                  </li>
                )}
                {customerData.returningRate > 0 && (
                  <li>
                    ✓ Returning customer rate is {customerData.returningRate.toFixed(1)}% - implement loyalty programs
                  </li>
                )}
                {customerData.avgLifetimeValue > 0 && (
                  <li>
                    ✓ Average lifetime value is GHS {customerData.avgLifetimeValue.toLocaleString()} - upselling opportunities exist
                  </li>
                )}
                {customerData.totalCustomers === 0 && (
                  <li>No customer data available yet. Start by creating some orders!</li>
                )}
              </>
            );
          })()}
        </ul>
      </div>
    </div>
  );
}



