'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMegaMenuStore } from '@/store/megaMenuStore';
import { MegaMenuTrigger } from './MegaMenuTrigger';
import { MegaMenuPanel } from './MegaMenuPanel';
import { Category } from '@/types/product';
import { getCategories } from '@/services/category.service';
import Link from 'next/link';

export const MegaMenu: React.FC = () => {
  const { activeMenu, closeMenu } = useMegaMenuStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch categories for mega menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories for mega menu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        console.log('Clicking outside mega menu, closing...');
        closeMenu();
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu, closeMenu]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeMenu]);

  if (isLoading) {
    return (
      <div className="hidden lg:flex items-center gap-1 relative">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="hidden lg:flex items-center gap-1 relative">
      {/* First 4 categories */}
      {categories.slice(0, 4).map((category) => (
        <div key={category.id} className="relative">
          <MegaMenuTrigger
            category={{
              id: category.id,
              title: category.name,
              slug: category.slug,
              image: category.thumbnail,
              icon: 'Package',
              columns: [
                {
                  title: 'Shop by Type',
                  items: [
                    { id: '1', title: category.name, href: `/categories/${category.slug}` },
                    { id: '2', title: 'All Products', href: `/categories/${category.slug}` },
                    { id: '3', title: 'New Arrivals', href: `/categories/${category.slug}?filter=new` },
                    { id: '4', title: 'Best Sellers', href: `/categories/${category.slug}?filter=bestsellers` },
                  ],
                },
                {
                  title: 'Popular Brands',
                  items: [
                    { id: '5', title: 'Apple', href: `/brand/apple?category=${category.slug}` },
                    { id: '6', title: 'Samsung', href: `/brand/samsung?category=${category.slug}` },
                    { id: '7', title: 'Xiaomi', href: `/brand/xiaomi?category=${category.slug}` },
                    { id: '8', title: 'Tecno', href: `/brand/tecno?category=${category.slug}` },
                  ],
                },
              ],
            }}
            isActive={activeMenu === category.id}
          />
          
          {activeMenu === category.id && (
            <MegaMenuPanel 
              category={{
                id: category.id,
                title: category.name,
                slug: category.slug,
                image: category.thumbnail,
                icon: 'Package',
                columns: [
                  {
                    title: 'Shop by Type',
                    items: [
                      { id: '1', title: category.name, href: `/categories/${category.slug}` },
                      { id: '2', title: 'All Products', href: `/categories/${category.slug}` },
                      { id: '3', title: 'New Arrivals', href: `/categories/${category.slug}?filter=new` },
                      { id: '4', title: 'Best Sellers', href: `/categories/${category.slug}?filter=bestsellers` },
                    ],
                  },
                  {
                    title: 'Popular Brands',
                    items: [
                      { id: '5', title: 'Apple', href: `/brand/apple?category=${category.slug}` },
                      { id: '6', title: 'Samsung', href: `/brand/samsung?category=${category.slug}` },
                      { id: '7', title: 'Xiaomi', href: `/brand/xiaomi?category=${category.slug}` },
                      { id: '8', title: 'Tecno', href: `/brand/tecno?category=${category.slug}` },
                    ],
                  },
                ],
              }} 
            />
          )}
        </div>
      ))}
      
      {/* View All Link */}
      <Link 
        href="/shop"
        className="px-4 py-2 text-sm font-medium text-[#3A3A3A] hover:text-[#FF7A19] transition-colors"
      >
        View All
      </Link>
    </div>
  );
};


