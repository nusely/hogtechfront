'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export function Select({ value, onValueChange, children, disabled = false, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function SelectTrigger({ children, id, className = '', ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const { isOpen, setIsOpen } = context;

  return (
    <button
      id={id}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      disabled={props.disabled}
      className={`
        w-full px-4 py-2.5 border border-gray-300 rounded-lg 
        bg-white text-left text-sm
        focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        flex items-center justify-between
        ${className}
      `}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown 
        size={16} 
        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  const { value } = context;

  if (children) {
    return <>{children}</>;
  }

  return <span className={value ? 'text-gray-900' : 'text-gray-500'}>{value || placeholder || 'Select...'}</span>;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  const { isOpen } = context;

  if (!isOpen) return null;

  return (
    <div
      className={`
        absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg
        max-h-60 overflow-auto
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({ value, children, className = '', disabled = false }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const { value: selectedValue, onValueChange, setIsOpen } = context;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
      setIsOpen(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        px-4 py-2 text-sm cursor-pointer transition-colors
        ${selectedValue === value ? 'bg-blue-50 text-[#163b86]' : 'text-gray-900 hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

