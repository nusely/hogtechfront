'use client';

import { useState, useEffect } from 'react';
import { Heart, Search, RefreshCcw, Mail, ShoppingCart, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/helpers';

interface WishlistItem {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_discount_price: number | null;
  added_at: string;
  time_elapsed: string;
  purchased: boolean;
  notified_on_sale: boolean;
  notified_on_stock: boolean;
}

export default function WishlistInsightsPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'purchased'>('active');

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [wishlistItems, searchTerm, filterStatus]);

  const formatTimeElapsed = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching wishlist items...');

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          purchased,
          purchased_at,
          notified_on_sale,
          notified_on_stock,
          product:products(
            id,
            name,
            price,
            discount_price
          ),
          user:users(
            id,
            first_name,
            last_name,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (wishlistError) {
        console.error('❌ Error fetching wishlist:', wishlistError);
        
        if (wishlistError.code === 'PGRST116' || wishlistError.message?.includes('does not exist')) {
          toast.error('Wishlist table not found. Please run the migration.');
          setWishlistItems([]);
          return;
        }
        
        throw wishlistError;
      }

      console.log('✅ Fetched', wishlistData?.length || 0, 'wishlist items');

      const items: WishlistItem[] = (wishlistData || [])
        .filter((item) => item.product)
        .map((item) => {
          const user = item.user as any;
          const product = Array.isArray(item.product) ? item.product[0] : item.product;

          const userName = user
            ? (user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown')
            : 'Guest';

          const currentPrice = product.discount_price || product.price || 0;

          return {
            id: item.id,
            user_id: item.user_id,
            customer_name: userName,
            customer_email: user?.email || 'No email',
            product_id: item.product_id,
            product_name: product?.name || 'Unknown Product',
            product_price: product?.price || 0,
            product_discount_price: product?.discount_price || null,
            added_at: item.created_at,
            time_elapsed: formatTimeElapsed(item.created_at),
            purchased: item.purchased || false,
            notified_on_sale: item.notified_on_sale || false,
            notified_on_stock: item.notified_on_stock || false,
          } as WishlistItem;
        });

      setWishlistItems(items);
    } catch (error) {
      console.error('❌ Error fetching wishlist items:', error);
      toast.error('Failed to load wishlist insights');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = wishlistItems;

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter((item) => !item.purchased);
    } else if (filterStatus === 'purchased') {
      filtered = filtered.filter((item) => item.purchased);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.customer_name.toLowerCase().includes(term) ||
          item.customer_email.toLowerCase().includes(term) ||
          item.product_name.toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  };

  const stats = {
    total: wishlistItems.length,
    active: wishlistItems.filter((i) => !i.purchased).length,
    purchased: wishlistItems.filter((i) => i.purchased).length,
    totalValue: wishlistItems
      .filter((i) => !i.purchased)
      .reduce((sum, item) => sum + (item.product_discount_price || item.product_price), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00afef]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-pink-600" size={32} />
                Wishlist Insights
              </h1>
              <p className="text-gray-600 mt-1">
                Track products customers want but haven't purchased yet
              </p>
            </div>
            <button
              onClick={fetchWishlistItems}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Heart className="text-pink-600" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Wishlists</p>
                  <p className="text-2xl font-bold text-[#00afef]">{stats.active}</p>
                </div>
                <TrendingUp className="text-[#00afef]" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.purchased}</p>
                </div>
                <ShoppingCart className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Potential Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <DollarSign className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by customer or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afef] focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afef] focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="active">Active Only</option>
                <option value="purchased">Purchased</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Table */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wishlist Items Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters.'
                : 'Customers haven\'t added any items to their wishlist yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">{item.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {item.product_discount_price ? (
                            <div>
                              <div className="text-[#00afef] font-semibold">
                                {formatCurrency(item.product_discount_price)}
                              </div>
                              <div className="text-gray-400 line-through text-xs">
                                {formatCurrency(item.product_price)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-900">
                              {formatCurrency(item.product_price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.time_elapsed}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.purchased ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Purchased
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            toast.success('Recovery email feature coming soon!')
                          }
                          className="text-[#00afef] hover:text-[#0099d6] font-medium flex items-center gap-1"
                          title="Send reminder email"
                        >
                          <Mail size={16} />
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DollarSign({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
