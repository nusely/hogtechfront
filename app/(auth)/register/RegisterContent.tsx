'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUp } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { customerService } from '@/services/customer.service';
import { motion } from 'framer-motion';
import { fadeIn, fadeInScale, fadeInUp } from '@/lib/motion';

export function RegisterContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (rateLimitCooldown !== null && rateLimitCooldown > 0) {
      setIsRateLimited(true);
      cooldownIntervalRef.current = setInterval(() => {
        setRateLimitCooldown((prev) => {
          if (prev === null || prev <= 1) {
            setIsRateLimited(false);
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
              cooldownIntervalRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsRateLimited(false);
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [rateLimitCooldown]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent rapid submissions (client-side debouncing)
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 2000) {
      toast.error('Please wait a moment before submitting again.');
      return;
    }
    lastSubmitTimeRef.current = now;

    // Check if rate limited
    if (isRateLimited) {
      toast.error(`Please wait ${rateLimitCooldown} seconds before trying again.`, {
        duration: 3000,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      if (error) {
        // Handle rate limiting (429 error)
        const errorWithStatus = error as any;
        if (
          errorWithStatus.status === 429 || 
          error.message?.includes('429') || 
          error.message?.toLowerCase().includes('too many requests') ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message === 'RATE_LIMIT_EXCEEDED'
        ) {
          // Set cooldown to 180 seconds (3 minutes)
          setRateLimitCooldown(180);
          toast.error(
            'Too many signup attempts. Please wait 3 minutes before trying again.',
            {
              duration: 6000,
              icon: '⏱️',
            }
          );
        } else if (error.message?.includes('already registered') || error.message?.includes('already exists') || error.message?.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in instead.', {
            duration: 5000,
          });
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        return;
      }

      if (user) {
        // Store email for verification page before clearing form
        const userEmail = formData.email;
        if (userEmail) {
          localStorage.setItem('pendingVerificationEmail', userEmail);
        }

        if (userEmail && user.id) {
          await customerService.linkCustomerToUser(userEmail, user.id);
        }
        
        // Clear any rate limit cooldown on success
        setRateLimitCooldown(null);
        setIsRateLimited(false);
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
        // Redirect to verification page
        setTimeout(() => {
          router.push(`/verify-email${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="max-w-md mx-auto" variants={fadeInUp} custom={0.05} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={fadeInUp} custom={0.1}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            Join VENTECH and start shopping for the latest gadgets
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-8"
          variants={fadeInScale}
          custom={0.12}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              icon={<User size={18} />}
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              icon={<User size={18} />}
            />

            {/* Email */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon={<Mail size={18} />}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              icon={<Phone size={18} />}
              placeholder="+233 XX XXX XXXX"
            />

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              icon={<Lock size={18} />}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              icon={<Lock size={18} />}
              autoComplete="new-password"
            />

            {/* Rate Limit Warning */}
            {isRateLimited && rateLimitCooldown !== null && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <Clock size={20} className="text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Too many signup attempts
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Please wait {rateLimitCooldown} seconds before trying again.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={isRateLimited || isLoading}
              icon={isRateLimited ? <Clock size={20} /> : <ArrowRight size={20} />}
            >
              {isRateLimited && rateLimitCooldown !== null
                ? `Wait ${rateLimitCooldown}s`
                : isLoading
                ? 'Creating Account...'
                : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-[#FF7A19] hover:text-orange-600 font-medium inline-flex items-center gap-2"
            >
              Sign in to your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-sm p-6"
          variants={fadeInScale}
          custom={0.2}
          initial="hidden"
          animate="visible"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-[#FF7A19]" />
            Why Create an Account?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Faster checkout and order tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Exclusive deals and discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Save your favorite products</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Order history and easy returns</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

