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
    try {
      const apiUrl = buildApiUrl('/api/settings');
      
      // Check if API URL is valid before attempting fetch
      if (!apiUrl || apiUrl.trim().length === 0) {
        throw new Error('API URL is not configured');
      }

      let url: URL;
      try {
        url = new URL(apiUrl);
      } catch (urlError) {
        throw new Error(`Invalid API URL: ${apiUrl}`);
      }

      if (params?.keys && params.keys.length > 0) {
        url.searchParams.append('keys', params.keys.join(','));
      }

      if (params?.category) {
        url.searchParams.append('category', params.category);
      }

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
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || {};
    } catch (error: any) {
      // Log error details for debugging
      console.warn('Failed to fetch settings from API, falling back to Supabase:', {
        error: error?.message || error,
        errorType: error?.name,
        url: buildApiUrl('/api/settings'),
      });

      // Fallback to Supabase
      try {
        let query = supabase.from('settings').select('key, value, category, description');
        if (params?.keys && params.keys.length > 0) {
          query = query.in('key', params.keys);
        }
        if (params?.category) {
          query = query.eq('category', params.category);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error('Supabase fallback also failed:', supabaseError);
          // Return empty object instead of throwing to prevent UI crashes
          return {};
        }

        const result: Record<string, string | null> = {};
        data?.forEach((setting) => {
          result[setting.key] = setting.value;
        });
        return result;
      } catch (fallbackError: any) {
        console.error('Both API and Supabase fallback failed:', fallbackError);
        // Return empty object instead of throwing to prevent UI crashes
        return {};
      }
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

