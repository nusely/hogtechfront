'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(error_description || 'Verification failed');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No verification code found');
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Exchange error:', exchangeError);
          setStatus('error');
          setMessage(exchangeError.message || 'Failed to verify email');
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Clear stored email from localStorage
          localStorage.removeItem('pendingVerificationEmail');
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Verifying Email</h1>
            <p className="text-[#3A3A3A]">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Email Verified!</h1>
            <p className="text-[#3A3A3A] mb-6">{message}</p>
            <p className="text-sm text-[#3A3A3A] mb-6">Redirecting you to the homepage...</p>
            <Link href="/">
              <Button variant="primary" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Verification Failed</h1>
            <p className="text-[#3A3A3A] mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  Go to Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Register Again
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

