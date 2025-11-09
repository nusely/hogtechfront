'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMegaMenuStore } from '@/store/megaMenuStore';
import { MegaMenuTrigger } from './MegaMenuTrigger';
import { MegaMenuPanel } from './MegaMenuPanel';
import { Category } from '@/types/product';
import { getCategories } from '@/services/category.service';
import { getBrands, Brand } from '@/services/brand.service';
import { supabasePublic } from '@/lib/supabase';
import Link from 'next/link';

export const MegaMenu: React.FC = () => {
  const { activeMenu, closeMenu } = useMegaMenuStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Category[]>>({});
  const [brandsMap, setBrandsMap] = useState<Record<string, Brand[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch categories, subcategories, and brands for mega menu
  useEffect(() => {
    const fetchMegaMenuData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all categories and determine top-level entries for the mega menu
        const allCategories = await getCategories();
        const topLevelCategories = allCategories.filter(cat => !cat.parent_id);

        const hasMegaMenuFlag = (item: unknown): boolean => {
          if (!item || typeof item !== 'object') {
            return false;
          }
          const flag = (item as { show_in_mega_menu?: boolean }).show_in_mega_menu;
          return flag === true;
        };

        const prioritized = topLevelCategories
          .filter(cat => hasMegaMenuFlag(cat))
          .sort((a, b) => {
            const orderA = typeof (a as any).display_order === 'number' ? (a as any).display_order : Number.MAX_SAFE_INTEGER;
            const orderB = typeof (b as any).display_order === 'number' ? (b as any).display_order : Number.MAX_SAFE_INTEGER;
            if (orderA === orderB) {
              return a.name.localeCompare(b.name);
            }
            return orderA - orderB;
          });

        const fallback = topLevelCategories
          .filter(cat => !hasMegaMenuFlag(cat))
          .sort((a, b) => a.name.localeCompare(b.name));

        const selectedCategories = [...prioritized, ...fallback].slice(0, 4);
        setCategories(selectedCategories);
        
        // Fetch subcategories for each main category
        const subcategories: Record<string, Category[]> = {};
        const brands: Record<string, Brand[]> = {};
        
        for (const category of selectedCategories) {
          // Get subcategories (children of this category)
          const subcats = allCategories.filter(cat => cat.parent_id === category.id);
          subcategories[category.id] = subcats;
          
          // Fetch brands that have products in this category and show in mega menu
          try {
            // Get brands from products in this category
            const { data: productsData } = await supabasePublic
              .from('products')
              .select('brand_id')
              .eq('category_id', category.id)
              .not('brand_id', 'is', null)
              .limit(10);
            
            if (productsData && productsData.length > 0) {
              const brandIds = [...new Set(productsData.map(p => p.brand_id).filter(Boolean))];
              const allBrands = await getBrands();
              const categoryBrands = allBrands
                .filter(b => brandIds.includes(b.id) && hasMegaMenuFlag(b))
                .slice(0, 4); // Limit to 4 brands
              brands[category.id] = categoryBrands;
            } else {
              brands[category.id] = [];
            }
          } catch (error) {
            console.error(`Error fetching brands for category ${category.id}:`, error);
            brands[category.id] = [];
          }
        }
        
        setSubcategoriesMap(subcategories);
        setBrandsMap(brands);
      } catch (error) {
        console.error('Error fetching mega menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMegaMenuData();
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
      {categories.map((category) => {
        const subcategories = subcategoriesMap[category.id] || [];
        const brands = brandsMap[category.id] || [];
        
        // Build columns dynamically
        const columns: Array<{
          title: string;
          items: Array<{ id: string; title: string; href: string }>;
        }> = [];
        
        // Shop by Type column - only if subcategories exist
        if (subcategories.length > 0) {
          columns.push({
            title: 'Shop by Type',
            items: [
              { id: category.id, title: category.name, href: `/categories/${category.slug}` },
              ...subcategories.map(subcat => ({
                id: subcat.id,
                title: subcat.name,
                href: `/categories/${subcat.slug}`
              })),
              { id: `${category.id}-all`, title: 'All Products', href: `/categories/${category.slug}` },
            ],
          });
        }
        
        // Popular Brands column - only if brands exist
        if (brands.length > 0) {
          columns.push({
            title: 'Popular Brands',
            items: brands.map(brand => ({
              id: brand.id,
              title: brand.name,
              href: `/shop?brand=${brand.slug}&category=${category.slug}`
            })),
          });
        }
        
        // If no subcategories and no brands, don't show mega menu for this category
        if (columns.length === 0) {
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="px-4 py-2 text-sm font-medium text-[#3A3A3A] hover:text-[#FF7A19] transition-colors"
            >
              {category.name}
            </Link>
          );
        }
        
        return (
          <div key={category.id} className="relative">
            <MegaMenuTrigger
              category={{
                id: category.id,
                title: category.name,
                slug: category.slug,
                image: category.thumbnail || (category as any).image_url,
                icon: 'Package',
                columns,
              }}
              isActive={activeMenu === category.id}
            />
            
            {activeMenu === category.id && (
              <MegaMenuPanel 
                category={{
                  id: category.id,
                  title: category.name,
                  slug: category.slug,
                  image: category.thumbnail || (category as any).image_url,
                  icon: 'Package',
                  columns,
                }} 
              />
            )}
          </div>
        );
      })}
      
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


