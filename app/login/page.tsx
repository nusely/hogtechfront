'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signIn, signOut, getUserProfile, resendVerificationEmail } from '@/services/auth.service';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { user, session, error } = await signIn(formData);
      
      if (error) {
        // Check if error is due to unverified email
        const errorMessage = (error as any)?.message?.toLowerCase() || '';
        const errorCode = (error as any)?.code || '';
        const errorStatus = (error as any)?.status;
        
        // Supabase AuthApiError with email not confirmed
        // Common error messages: "Email not confirmed", "email_not_confirmed"
        const isEmailNotConfirmed = 
          errorMessage.includes('email not confirmed') ||
          errorMessage.includes('email_not_confirmed') ||
          errorCode === 'email_not_confirmed' ||
          (errorStatus === 400 && errorMessage.includes('not confirmed'));
        
        if (isEmailNotConfirmed) {
          // Email not confirmed - show verification prompt instead of error
          console.log('Email not confirmed - showing verification prompt');
          setUnverifiedEmail(formData.email);
          setShowVerificationPrompt(true);
          setIsLoading(false);
          return; // Don't redirect, show verification prompt
        }
        
        // Other errors - throw to be caught by catch block
        throw error;
      }

      if (user && session) {
        // Check if email is verified (in case Supabase allows sign-in but email is not verified)
        if (!user.email_confirmed_at) {
          // Email not verified - show verification prompt
          setUnverifiedEmail(user.email || formData.email);
          setShowVerificationPrompt(true);
          setIsLoading(false);
          return; // Don't redirect yet
        }

        // Get user profile
        const profile = await getUserProfile(user.id);
        
        if (profile) {
          // Handle both first_name/last_name and full_name formats
          const profileData = profile as any;
          const firstName = profileData.first_name || '';
          const lastName = profileData.last_name || '';
          const fullNameFromDb = profileData.full_name || '';
          const fullName = fullNameFromDb || `${firstName} ${lastName}`.trim() || user.email || '';
          
          dispatch(setUser({
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            phone: profileData.phone || '',
            avatar_url: profileData.avatar_url || undefined,
            role: profileData.role || 'customer',
            email_verified: user.email_confirmed_at ? true : false,
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString(),
          }));
          
          toast.success(`Welcome back, ${firstName || fullName.split(' ')[0] || 'User'}!`);
          
          // Redirect based on role
          if (profileData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          // No profile found, redirect to home
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setErrors({ form: error.message || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setIsResendingVerification(true);
    try {
      const { error } = await resendVerificationEmail(unverifiedEmail);
      
      if (error) {
        throw error;
      }

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <Link href="/" className="inline-block">
              <div className="text-2xl font-bold text-[#FF7A19]">VENTECH</div>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-[#FF7A19] hover:text-orange-600"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#3A3A3A]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  suppressHydrationWarning
                  className="appearance-none rounded-t-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF7A19] focus:border-[#FF7A19] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#3A3A3A]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  suppressHydrationWarning
                  className="appearance-none rounded-b-lg relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF7A19] focus:border-[#FF7A19] focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3A] hover:text-[#FF7A19]"
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#FF7A19] focus:ring-[#FF7A19] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-[#FF7A19] hover:text-orange-600"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {errors.form && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.form}</p>
            </div>
          )}

          {showVerificationPrompt && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Email Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your email address <strong>{unverifiedEmail}</strong> has not been verified yet.
                      Please check your inbox and click the verification link, or request a new one.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowVerificationPrompt(false);
                          setUnverifiedEmail('');
                          // Sign out the user since they're not verified
                          signOut();
                        }}
                        className="ml-3 bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-medium text-[#FF7A19] hover:text-orange-600"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

