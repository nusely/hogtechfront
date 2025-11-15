import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#00afef] to-[#163b86] text-white hover:from-[#0099d6] hover:to-[#0f2d6b] focus:ring-[#00afef] active:from-[#0083bd] active:to-[#0a1f52] shadow-lg hover:shadow-xl transition-all',
    secondary: 'bg-gradient-to-r from-[#163b86] to-[#1a4ba0] text-white hover:from-[#0f2d6b] hover:to-[#163b86] focus:ring-[#163b86] active:from-[#0a1f52] active:to-[#0f2d6b] shadow-lg hover:shadow-xl transition-all',
    outline: 'border-2 border-[#00afef] text-[#00afef] hover:bg-blue-50 focus:ring-[#00afef] hover:border-[#163b86] hover:text-[#163b86]',
    ghost: 'text-[#3A3A3A] hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      suppressHydrationWarning
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {!isLoading && icon && icon}
      {children}
    </button>
  );
};

