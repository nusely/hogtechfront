import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

const withAuthHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : {};
};

export const adminSettingsService = {
  async getSettings(params?: { keys?: string[]; category?: string }) {
    const url = new URL(buildApiUrl('/api/settings'));

    if (params?.keys && params.keys.length > 0) {
      url.searchParams.append('keys', params.keys.join(','));
    }

    if (params?.category) {
      url.searchParams.append('category', params.category);
    }

    try {
      const authHeaders = await withAuthHeaders();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...authHeaders,
      };

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Falling back to Supabase for settings:', error);
      }

      let query = supabase.from('settings').select('key, value, category, description');
      if (params?.keys && params.keys.length > 0) {
        query = query.in('key', params.keys);
      }
      if (params?.category) {
        query = query.eq('category', params.category);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message || 'Failed to fetch settings');
      }

      const result: Record<string, string | null> = {};
      data?.forEach((setting) => {
        result[setting.key] = setting.value;
      });
      return result;
    }
  },

  async updateSettings(updates: Array<{ key: string; value: unknown; category?: string; description?: string }>) {
    if (!updates || updates.length === 0) {
      return {};
    }

    const authHeaders = await withAuthHeaders();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    const response = await fetch(buildApiUrl('/api/settings'), {
      method: 'PUT',
      headers,
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update settings');
    }

    const result = await response.json();
    return result.data || {};
  },
};

