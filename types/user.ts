export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: 'admin' | 'customer';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  addresses: Address[];
  order_count: number;
  wishlist_count: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string; // e.g., "Home", "Work"
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  current_password: string;
  new_password: string;
}


