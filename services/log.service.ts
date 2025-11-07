import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : {};
};

export interface AdminLogEntry {
  id: string;
  action: string;
  user_id?: string | null;
  role?: string | null;
  status_code?: number | null;
  duration_ms?: number | null;
  ip_address?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

export interface AdminLogResponse {
  logs: AdminLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const logService = {
  async getAdminLogs(page: number = 1, limit: number = 50): Promise<AdminLogResponse> {
    const authHeaders = await getAuthHeader();

    const url = new URL(buildApiUrl('/api/logs'));
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch logs');
    }

    const result = await response.json();
    return result.data as AdminLogResponse;
  },
};

export default logService;

