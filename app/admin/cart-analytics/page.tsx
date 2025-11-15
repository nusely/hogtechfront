'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Mail,
  Search,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface AbandonedCart {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  items_count: number;
  cart_value: number;
  abandoned_at: string;
  time_elapsed: string;
  products: string[];
  recovery_sent: boolean;
}

export default function CartAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const formatTimeElapsed = (timestamp: string) => {
    const abandonedDate = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - abandonedDate.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      const hours = Math.max(diffHours, 1);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (diffDays === 1) {
      return '1 day ago';
    }

    return `${diffDays} days ago`;
  };

  const calculateItemSubtotal = (item: any) => {
    const quantity = Number(item.quantity) || 0;
    if (!item.product) return 0;

    const basePrice =
      typeof item.product.discount_price === 'number' && !Number.isNaN(item.product.discount_price)
        ? item.product.discount_price
        : typeof item.product.original_price === 'number'
          ? item.product.original_price
          : 0;

    const selectedVariants = item.selected_variants || {};
    const variantAdjustments = Object.values(selectedVariants as Record<string, any>).reduce((sum: number, variant: any) => {
      if (!variant || typeof variant !== 'object') return sum;
      const adjustmentRaw = variant.price_modifier ?? variant.price_adjustment ?? 0;
      const adjustment = typeof adjustmentRaw === 'number'
        ? adjustmentRaw
        : parseFloat(adjustmentRaw);

      if (Number.isNaN(adjustment)) {
        return sum;
      }

      return sum + adjustment;
    }, 0);

    const finalPrice = basePrice + variantAdjustments;
    return quantity * finalPrice;
  };

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      
      // Fetch cart items that haven't been updated in over 24 hours (abandoned carts)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: abandonedItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          quantity,
          selected_variants,
          created_at,
          updated_at,
          product:products(
            id,
            name,
            original_price,
            discount_price
          ),
          user:users!cart_items_user_id_fkey(
            id,
            first_name,
            last_name,
            full_name,
            email
          )
        `)
        .lt('updated_at', twentyFourHoursAgo)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching abandoned carts:', error);
        // Check if it's a foreign key relationship error
        if (error.message?.includes('relationship') || error.message?.includes('does not exist')) {
          console.error('💡 Foreign key relationship missing. Please run the database migration.');
          throw new Error('Database schema needs to be updated. Please run the migration SQL.');
        }
        throw error;
      }

      const rawCarts = (abandonedItems || [])
        .filter((item) => (item.quantity ?? 0) > 0 && item.product)
        .map((item) => {
          const user = item.user as any;
          const productRecord = Array.isArray((item as any).product)
            ? (item as any).product[0]
            : (item as any).product;
          const productName = productRecord?.name ?? 'Unknown Product';

          const userName = user
            ? (user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown')
            : 'Guest';

          const key =
            (user && !Array.isArray(user) && user.email)
              ? user.email.toLowerCase()
              : item.user_id || item.id;

          const cartId = typeof key === 'string' ? key : item.id;

          return {
            id: cartId,
            user_id: item.user_id || (user && !Array.isArray(user) ? user.id : undefined),
            customer_name: userName,
            customer_email:
              user && !Array.isArray(user) && user.email ? user.email : 'No email',
            items_count: Number(item.quantity) || 0,
            cart_value: calculateItemSubtotal(item),
            abandoned_at: item.updated_at || item.created_at,
            time_elapsed: formatTimeElapsed(item.updated_at || item.created_at),
            products: [productName],
            recovery_sent: false,
          } as AbandonedCart;
        });

      const mergedCartsMap = rawCarts.reduce<Map<string, AbandonedCart>>((acc, cart) => {
        const key = cart.customer_email !== 'No email'
          ? cart.customer_email.toLowerCase()
          : cart.user_id || cart.id; // Keep guests separate by cart entry

        const existing = acc.get(key);

        if (!existing) {
          acc.set(key, cart);
          return acc;
        }

        const newerAbandonedAt =
          new Date(existing.abandoned_at) > new Date(cart.abandoned_at)
            ? existing.abandoned_at
            : cart.abandoned_at;

        const combinedProducts = Array.from(
          new Set([...existing.products, ...cart.products])
        );

        acc.set(key, {
          ...existing,
          items_count: existing.items_count + cart.items_count,
          cart_value: parseFloat((existing.cart_value + cart.cart_value).toFixed(2)),
          abandoned_at: newerAbandonedAt,
          time_elapsed: formatTimeElapsed(newerAbandonedAt),
          products: combinedProducts,
          recovery_sent: existing.recovery_sent || cart.recovery_sent,
        });

        return acc;
      }, new Map());

      const mergedCarts = Array.from(mergedCartsMap.values()).sort(
        (a, b) =>
          new Date(b.abandoned_at).getTime() - new Date(a.abandoned_at).getTime()
      );

      setCarts(mergedCarts);
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = carts.filter(
    (cart) =>
      cart.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cart.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCarts = filteredCarts.length;
  const totalValue = filteredCarts.reduce((sum, c) => sum + c.cart_value, 0);
  
  // Recovery rate: Calculate based on carts that were recovered (converted to orders)
  // For now, we'll track carts that had recovery emails sent and were later converted
  // In a real implementation, you'd track which carts were recovered by checking if
  // the user later completed an order with similar items
  const recoveredCarts = filteredCarts.filter((c) => c.recovery_sent).length;
  const recoveryRate = totalCarts > 0 
    ? Math.round((recoveredCarts / totalCarts) * 100) 
    : 0;

  const sendRecoveryEmail = (cartId: string) => {
    // TODO: Implement email sending
    setCarts(
      carts.map((cart) =>
        cart.id === cartId ? { ...cart, recovery_sent: true } : cart
      )
    );
    alert(`Recovery email sent for cart ${cartId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00afef] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading cart analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-6 border-2 border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="text-yellow-600" size={32} />
          </div>
          <p className="text-sm text-yellow-700 mb-1">Abandoned Carts</p>
          <p className="text-3xl font-bold text-yellow-900">{totalCarts}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-red-600" size={32} />
          </div>
          <p className="text-sm text-red-700 mb-1">Lost Revenue</p>
          <p className="text-3xl font-bold text-red-900">
            GHS {totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-600" size={32} />
          </div>
          <p className="text-sm text-blue-700 mb-1">Recovery Emails Sent</p>
          <p className="text-3xl font-bold text-blue-900">
            {filteredCarts.filter((c) => c.recovery_sent).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="text-green-600" size={32} />
          </div>
          <p className="text-sm text-green-700 mb-1">Recovery Rate</p>
          <p className="text-3xl font-bold text-green-900">{recoveryRate}%</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-[#163b86] flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-[#163b86] mb-2">Recover Lost Sales</h3>
            <p className="text-sm text-[#163b86] mb-3">
              Send personalized recovery emails to customers who abandoned their carts. Offer a
              small discount (5-10%) to encourage them to complete their purchase within 24
              hours!
            </p>
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Mail size={16} />}
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                Send Bulk Recovery Emails
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<MessageSquare size={16} />}
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                Send Bulk Recovery SMS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
          />
        </div>
      </div>

      {/* Abandoned Carts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Abandoned Carts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredCarts.length === 0 ? (
            <div className="p-12 text-center text-[#3A3A3A]">
              No abandoned carts found
            </div>
          ) : (
            filteredCarts.map((cart) => (
              <div key={cart.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#1A1A1A]">{cart.customer_name}</h3>
                      {cart.recovery_sent && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          ✉️ Email Sent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#3A3A3A] mb-2">{cart.customer_email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[#3A3A3A]">
                        <strong>{cart.items_count}</strong> items
                      </span>
                      <span className="text-[#00afef] font-semibold text-lg">
                        GHS {cart.cart_value.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[#3A3A3A]">
                        <Clock size={14} />
                        {cart.time_elapsed}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Mail size={16} />}
                    onClick={() => sendRecoveryEmail(cart.id)}
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Send Recovery Email
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-[#3A3A3A] mb-2 font-semibold">
                    Items in cart:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cart.products.map((product, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#3A3A3A]"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



