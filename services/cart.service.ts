'use client';

import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';
import { CartItem } from '@/types/product';

const getAuthToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

const transformServerItem = (entry: any): CartItem | null => {
  const product = entry?.product;
  if (!product || !product?.id) {
    return null;
  }

  const quantity = Number(entry?.quantity ?? 1) || 1;
  const selectedVariants = entry?.selected_variants || {};

  const unitPrice = (() => {
    if (typeof product.discount_price === 'number') return product.discount_price;
    if (typeof product.discount_price === 'string') return parseFloat(product.discount_price);
    if (typeof product.price === 'number') return product.price;
    if (typeof product.price === 'string') return parseFloat(product.price);
    if (typeof product.original_price === 'number') return product.original_price;
    if (typeof product.original_price === 'string') return parseFloat(product.original_price);
    return 0;
  })();

  const subtotal = Number((unitPrice * quantity).toFixed(2));

  return {
    ...product,
    quantity,
    selected_variants: selectedVariants,
    subtotal,
    base_product_id: product.id,
  } as CartItem;
};

const serializeCartItems = (items: CartItem[]) =>
  items
    .map((item) => {
      const baseProductId = item.base_product_id ?? item.id;

      if (!baseProductId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Skipping cart item without a resolvable product id during sync:', {
            id: item.id,
            base_product_id: item.base_product_id,
          });
        }
        return null;
      }

      return {
        product_id: baseProductId,
        quantity: item.quantity,
        selected_variants: item.selected_variants || {},
      };
    })
    .filter((payload): payload is Exclude<typeof payload, null> => payload !== null);

export const cartService = {
  async fetchCart(): Promise<CartItem[]> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return [];
      }

      const apiUrl = buildApiUrl('/api/cart');
      console.log('🛒 Fetching cart from:', apiUrl);
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.warn('⚠️ Failed to fetch cart from backend:', response.status, response.statusText);
          return [];
        }
      } catch (error: any) {
        console.error('❌ Cart fetch error:', {
          message: error?.message,
          name: error?.name,
          apiUrl,
          error,
        });
        return [];
      }

      const result = await response.json();
      if (!result?.success || !Array.isArray(result?.data)) {
        return [];
      }

      const transformed = (result.data as unknown[])
        .map(transformServerItem)
        .filter((item): item is CartItem => item !== null);

      return transformed;
    } catch (error) {
      console.error('Error fetching cart from backend:', error);
      return [];
    }
  },

  async syncCart(items: CartItem[]): Promise<void> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return;
      }

      const payload = { items: serializeCartItems(items) };

      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to sync cart:', errorData || response.statusText);
      }
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
    }
  },

  async clearCart(): Promise<void> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return;
      }

      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to clear cart:', errorData || response.statusText);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
};
