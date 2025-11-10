import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

export const customerService = {
  async linkCustomerToUser(email: string, userId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return null;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };

      const response = await fetch(buildApiUrl('/api/customers/link-user'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, user_id: userId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to link customer record');
      }

      return await response.json();
    } catch (error) {
      console.error('Error linking customer to user:', error);
      return null;
    }
  },
};
