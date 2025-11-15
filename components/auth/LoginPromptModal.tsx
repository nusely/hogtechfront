'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, UserPlus, Heart, ShoppingCart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: 'wishlist' | 'cart' | 'general';
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  action = 'general',
}) => {
  const getTitle = () => {
    switch (action) {
      case 'wishlist':
        return 'Sign in to add to wishlist';
      case 'cart':
        return 'Sign in to continue shopping';
      default:
        return 'Sign in required';
    }
  };

  const getMessage = () => {
    switch (action) {
      case 'wishlist':
        return 'Create an account or sign in to save your favorite products to your wishlist.';
      case 'cart':
        return 'Create an account or sign in to continue adding items to your cart and complete your purchase.';
      default:
        return 'Please create an account or sign in to continue.';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'wishlist':
        return <Heart size={48} className="text-[#00afef]" />;
      case 'cart':
        return <ShoppingCart size={48} className="text-[#00afef]" />;
      default:
        return <UserPlus size={48} className="text-[#00afef]" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={getTitle()}>
      <div className="text-center py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full">
            {getIcon()}
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-lg">
          {getMessage()}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="flex-1" onClick={onClose}>
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base px-5 py-2.5 gap-2"
              icon={<UserPlus size={18} />}
            >
              Create Account
            </Button>
          </Link>
          <Link href="/login" className="flex-1" onClick={onClose}>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base px-5 py-2.5 gap-2"
              icon={<LogIn size={18} />}
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-6">
          New customers get exclusive deals and faster checkout!
        </p>
      </div>
    </Modal>
  );
};

