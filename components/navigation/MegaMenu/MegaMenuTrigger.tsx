'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useMegaMenuStore } from '@/store/megaMenuStore';
import { MegaMenuCategory } from '@/types/megaMenu';

interface MegaMenuTriggerProps {
  category: MegaMenuCategory;
  isActive: boolean;
}

export const MegaMenuTrigger: React.FC<MegaMenuTriggerProps> = ({ category, isActive }) => {
  const { setActiveMenu, closeMenu } = useMegaMenuStore();

  const handleClick = () => {
    if (isActive) {
      closeMenu();
    } else {
      setActiveMenu(category.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${isActive 
          ? 'bg-[#FF7A19] text-white' 
          : 'text-[#1A1A1A] hover:bg-orange-50 hover:text-[#FF7A19]'
        }
      `}
    >
      <span>{category.title}</span>
      <ChevronDown 
        size={14} 
        className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
      />
    </button>
  );
};


