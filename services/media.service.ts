import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token
      ? {
          Authorization: `Bearer ${session.access_token}`,
        }
      : {};
  } catch (error) {
    console.error('Error retrieving auth token for media requests:', error);
    return {};
  }
};

const listFilesFromSupabase = async (folder?: string, maxKeys?: number): Promise<MediaFile[]> => {
  try {
    let query = supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (folder && folder !== 'all') {
      query = query.eq('folder', folder);
    }

    if (maxKeys && maxKeys > 0) {
      query = query.limit(maxKeys);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw error || new Error('No data');
    }

    return data.map((item: any) => {
      const url: string = item.url || '';
      const keyFromDb: string | undefined = item.key || item.file_key || item.file_name || item.filename;
      let key = keyFromDb;
      if (!key && url) {
        try {
          key = new URL(url).pathname.replace(/^\//, '');
        } catch {
          key = url;
        }
      }
      const sizeCandidate = item.size ?? item.file_size ?? item.bytes;
      const size = typeof sizeCandidate === 'number' ? sizeCandidate : undefined;
      const lastModifiedRaw = item.updated_at || item.modified_at || item.created_at;
      const lastModified = lastModifiedRaw ? new Date(lastModifiedRaw) : undefined;

      return {
        key: key || 'media-library-item',
        url,
        size,
        lastModified,
      } as MediaFile;
    });
  } catch (error) {
    console.warn('Media library Supabase fallback failed:', error);
    return [];
  }
};

const fetchFromSupabaseFallback = async (folder?: string, maxKeys?: number): Promise<MediaFile[]> => {
  try {
    let query = supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (folder && folder !== 'all') {
      query = query.eq('folder', folder);
    }

    if (maxKeys && maxKeys > 0) {
      query = query.limit(maxKeys);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw error || new Error('No media records found');
    }

    return data.map((item: any) => {
      const url: string = item.url || '';
      let key = item.key || item.file_key || item.file_name || item.filename;
      if (!key && url) {
        try {
          key = new URL(url).pathname.replace(/^\//, '');
        } catch {
          key = url;
        }
      }

      const rawSize = item.size ?? item.file_size ?? item.bytes;
      const size = typeof rawSize === 'number' ? rawSize : undefined;
      const rawDate = item.updated_at || item.modified_at || item.created_at;
      const lastModified = rawDate ? new Date(rawDate) : undefined;

      return {
        key: key || 'media-item',
        url,
        size,
        lastModified,
      } as MediaFile;
    });
  } catch (error) {
    console.warn('Supabase media fallback failed:', error);
    return [];
  }
};

export interface MediaFile {
  key: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

export interface MediaListResponse {
  success: boolean;
  files?: MediaFile[];
  count?: number;
  error?: string;
}

export const mediaService = {
  // List all media files (optionally filtered by folder)
  async listFiles(folder?: string, maxKeys?: number): Promise<MediaFile[]> {
    try {
      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);
      if (maxKeys) params.append('maxKeys', maxKeys.toString());

      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        console.warn('Media list request skipped: no auth token available yet.');
        return [];
      }

      const url = new URL('/api/upload/list', buildApiUrl('/'));
      params.forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      const headers: HeadersInit = authHeaders;

      const response = await fetch(url.toString(), {
        headers,
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const message = (errorPayload as MediaListResponse)?.error || response.statusText;
        throw new Error(message || `Failed to list files (HTTP ${response.status})`);
      }
      const data: MediaListResponse = await response.json();

      if (data.success && data.files) {
        return data.files;
      }

      throw new Error(data.error || 'Failed to list files');
    } catch (error: any) {
      console.error('Error listing media files:', error);

      if (error instanceof TypeError || `${error?.message}`.includes('Failed to fetch')) {
        const fallbackFiles = await fetchFromSupabaseFallback(folder, maxKeys);
        if (fallbackFiles.length > 0) {
          return fallbackFiles;
        }
      }

      return [];
    }
  },

  // Upload a single file
  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required');
      }

      const url = new URL('/api/upload', buildApiUrl('/'));
      url.searchParams.set('folder', folder);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        return data.url;
      }

      throw new Error(data.error || 'Failed to upload file');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], folder: string = 'uploads'): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required');
      }

      const url = new URL('/api/upload/multiple', buildApiUrl('/'));
      url.searchParams.set('folder', folder);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls) {
        return data.urls;
      }

      throw new Error(data.error || 'Failed to upload files');
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },

  // Delete a file
  async deleteFile(url: string): Promise<boolean> {
    try {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required');
      }

      const response = await fetch(buildApiUrl('/api/upload'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        return true;
      }

      throw new Error(data.error || 'Failed to delete file');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};

