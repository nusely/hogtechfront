import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

// Sign up with email and password (via backend API - bypasses Supabase email sending)
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // Sign up via backend API using Admin API (bypasses Supabase email rate limits)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(responseData.message || 'Failed to create account') as any;
      error.status = response.status;
      error.code = responseData.errors?.code;
      throw error;
    }

    // User was created successfully via Admin API
    // Now we need to sign them in to get a session
    // But first, let's check if the user was created
    const backendUser = responseData.data?.user;
    
    if (!backendUser) {
      throw new Error('User created but user data not returned');
    }

    // Sign in the user to get a session
    // Note: Since we created the user with email_confirm: false, they might need to verify first
    // But we'll try to sign them in anyway
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      // If sign-in fails (e.g., email not confirmed), that's okay
      // The user was created, they just need to verify their email first
      console.warn('[SignUp] User created but sign-in failed (may need email verification):', signInError.message);
      
      // Return the user data from backend (without session)
      return {
        user: {
          id: backendUser.id,
          email: backendUser.email,
          email_confirmed_at: backendUser.email_confirmed_at,
          user_metadata: backendUser.user_metadata,
        } as User,
        session: null,
        error: null,
      };
    }

    console.log('[SignUp] Account created and signed in successfully via backend API');
    return {
      user: authData.user,
      session: authData.session,
      error: null,
    };
  } catch (error: any) {
    // Check for specific error types
    if (error.status === 409) {
      // User already exists
      const duplicateError = new Error('User with this email already exists') as any;
      duplicateError.status = 409;
      return {
        user: null,
        session: null,
        error: duplicateError,
      };
    }

    if (error.status === 429) {
      // Rate limit (shouldn't happen with backend, but handle it)
      const rateLimitError = new Error('Too many requests. Please wait a few minutes before trying again.') as any;
      rateLimitError.status = 429;
      return {
        user: null,
        session: null,
        error: rateLimitError,
      };
    }

    return {
      user: null,
      session: null,
      error: error,
    };
  }
};

// Sign in with email and password
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return {
      user: authData.user,
      session: authData.session,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      session: null,
      error: error,
    };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Send password reset email (via backend API using Resend)
export const resetPassword = async (data: ResetPasswordData): Promise<{ error: Error | null }> => {
  try {
    // Send password reset email via our backend API (Resend) instead of Supabase
    // This bypasses Supabase email rate limits
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/auth/send-password-reset-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Failed to send password reset email') as any;
      error.status = response.status;
      throw error;
    }

    console.log('[ResetPassword] Password reset email sent via backend API (Resend)');
    return { error: null };
  } catch (error: any) {
    console.error('[ResetPassword] Error sending password reset email:', error);
    return { error };
  }
};

// Update password (after reset)
export const updatePassword = async (data: UpdatePasswordData): Promise<{ error: Error | null }> => {
  try {
    const { error} = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

// Resend verification email (via backend API using Resend)
export const resendVerificationEmail = async (email: string): Promise<{ error: Error | null }> => {
  try {
    // Send verification email via our backend API (Resend) instead of Supabase
    // This bypasses Supabase email rate limits
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Failed to resend verification email') as any;
      error.status = response.status;
      throw error;
    }

    console.log('[ResendVerificationEmail] Verification email sent via backend API (Resend)');
    return { error: null };
  } catch (error: any) {
    console.error('[ResendVerificationEmail] Error sending verification email:', error);
    return { error };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// Get user profile from public.users table
export const getUserProfile = async (userId?: string) => {
  try {
    // If no userId provided, get the current user's ID
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No error log - user might be logged out
        return null;
      }
      userId = user.id;
    }

    // Use maybeSingle() instead of single() to handle missing/duplicate records gracefully
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      
      // If error is about duplicates, log more details
      if (error.message.includes('multiple') || error.message.includes('coerce')) {
        console.error('⚠️ DUPLICATE USER PROFILES DETECTED!');
        console.error('Run fix_duplicate_users.sql to clean up the database');
      }
      
      return null;
    }

    if (!data) {
      console.warn('No user profile found for ID:', userId);
      
      // Try to create the profile if it doesn't exist
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          // Build profile data - handle both name and first_name/last_name schemas
          const firstName = user.user_metadata?.first_name || user.user_metadata?.firstName || '';
          const lastName = user.user_metadata?.last_name || user.user_metadata?.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User';
          
          const profileData: any = {
            id: user.id,
            email: user.email || '',
            phone: user.user_metadata?.phone || user.phone || null,
            role: 'customer',
          };

          // Try to use first_name/last_name if columns exist, otherwise use name
          try {
            // First, check if profile already exists (might have been created by trigger)
            const { data: existingProfile, error: checkError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (existingProfile) {
              // Profile already exists, update it with missing fields
              const updateData: any = {
                email: user.email || '',
                updated_at: new Date().toISOString(),
              };

              // Try to update with first_name/last_name if columns exist
              const { data: updatedProfile, error: updateError } = await supabase
                .from('users')
                .update({
                  ...updateData,
                  first_name: firstName || existingProfile.first_name || '',
                  last_name: lastName || existingProfile.last_name || '',
                  full_name: fullName || existingProfile.full_name || '',
                  phone: user.user_metadata?.phone || user.phone || existingProfile.phone,
                })
                .eq('id', user.id)
                .select()
                .single();

              if (updateError) {
                // If update with first_name/last_name fails, try with just full_name
                if (updateError.message?.includes('column') || updateError.code === '42703') {
                  const { data: updatedProfile2, error: updateError2 } = await supabase
                    .from('users')
                    .update({
                      ...updateData,
                      full_name: fullName || existingProfile.full_name,
                      phone: user.user_metadata?.phone || user.phone || existingProfile.phone,
                    })
                    .eq('id', user.id)
                    .select()
                    .single();

                  if (updateError2) {
                    console.error('Error updating user profile (with name field):', {
                      error: updateError2,
                      message: updateError2.message,
                      code: updateError2.code,
                      details: updateError2.details,
                    });
                    // Return existing profile even if update failed
                    return {
                      ...existingProfile,
                      full_name: fullName,
                      first_name: firstName,
                      last_name: lastName,
                    };
                  }
                  return {
                    ...updatedProfile2,
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                  };
                } else {
                  console.error('Error updating user profile:', {
                    error: updateError,
                    message: updateError.message,
                    code: updateError.code,
                    details: updateError.details,
                  });
                  // Return existing profile even if update failed
                  return {
                    ...existingProfile,
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                  };
                }
              }

              return {
                ...updatedProfile,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
              };
            }

            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                ...profileData,
                first_name: firstName || '',
                last_name: lastName || '',
                full_name: fullName || '',
              })
              .select()
              .single();

            if (createError) {
              // If error, try with 'full_name' field only (might be the actual schema)
              if (createError.message?.includes('column') || createError.code === '42703') {
                const { data: newProfile2, error: createError2 } = await supabase
                  .from('users')
                  .insert({
                    ...profileData,
                    full_name: fullName,
                  })
                  .select()
                  .single();

                if (createError2) {
                  // Check if it's a duplicate key error (profile already exists)
                  if (createError2.code === '23505' || createError2.message?.includes('duplicate') || createError2.message?.includes('unique')) {
                    console.log('Profile already exists, fetching existing profile');
                    // Fetch the existing profile
                    const { data: existing, error: fetchError } = await supabase
                      .from('users')
                      .select('*')
                      .eq('id', user.id)
                      .single();

                    if (existing && !fetchError) {
                      return {
                        ...existing,
                        full_name: fullName,
                        first_name: firstName,
                        last_name: lastName,
                      };
                    }
                  }
                  console.error('Error creating user profile (with name field):', {
                    error: createError2,
                    message: createError2.message,
                    code: createError2.code,
                    details: createError2.details,
                  });
                  return null;
                }
                // Format the response to match User type
                return {
                  ...newProfile2,
                  full_name: fullName,
                  first_name: firstName,
                  last_name: lastName,
                };
              } else {
                // Check if it's a duplicate key error (profile already exists)
                if (createError.code === '23505' || createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
                  console.log('Profile already exists, fetching existing profile');
                  // Fetch the existing profile
                  const { data: existing, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                  if (existing && !fetchError) {
                    return {
                      ...existing,
                      full_name: fullName,
                      first_name: firstName,
                      last_name: lastName,
                    };
                  }
                }
                console.error('Error creating user profile:', {
                  error: createError,
                  message: createError.message,
                  code: createError.code,
                  details: createError.details,
                });
                return null;
              }
            }

            // Format the response to match User type
            return {
              ...newProfile,
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
            };
          } catch (insertError: any) {
            console.error('Error inserting user profile:', {
              error: insertError,
              message: insertError?.message,
              code: insertError?.code,
              details: insertError?.details,
            });
            return null;
          }
        }
      } catch (error: any) {
        console.error('Error creating user profile:', error);
      }
      
      return null;
    }

    // Format the response to match User type - construct full_name from first_name + last_name
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || data.full_name || data.email?.split('@')[0] || 'User';
    
    return {
      ...data,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
    };
  } catch (error: any) {
    // Only log actual errors, not "user not authenticated"
    if (error?.message && !error.message.includes('not authenticated')) {
      console.error('Error fetching user profile:', error.message);
    }
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<{
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  shipping_address: any;
  billing_address: any;
  newsletter_subscribed: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  avatar_url: string;
}>) => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('Updating profile for user:', user.id);
    console.log('Updates:', updates);

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    console.log('Profile updated successfully:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// Export as object for convenience
export const authService = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  resendVerificationEmail,
  onAuthStateChange,
};
