import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use dummy values during build if env vars are missing (for static generation)
const buildSafeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const buildSafeKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase credentials not found. Please add them to .env.local');
  }
}

export const supabase = createClient(buildSafeUrl, buildSafeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Create an anonymous client for public data (no auth token)
export const supabasePublic = createClient(buildSafeUrl, buildSafeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  return user;
};

// Helper function to check if user is admin
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error checking admin status:', error.message);
    return false;
  }

  return data?.role === 'admin' || data?.role === 'superadmin';
};

