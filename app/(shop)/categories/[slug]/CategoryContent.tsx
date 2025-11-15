'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { ProductListSkeleton } from '@/components/loaders/ProductCardSkeleton';
import { QuickView } from '@/components/shop/QuickView';
import { ArrowLeft, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { Category } from '@/types/product';
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';
import { getFilterBrands } from '@/services/brand.service';
import { getCategories, getCategoryBySlug, getFilterCategories } from '@/services/category.service';

interface CategoryContentProps {
  initialCategory: Category | null;
  slug: string;
}

export function CategoryContent({ initialCategory, slug }: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [isCategoryLoading, setIsCategoryLoading] = useState(!initialCategory);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc' | 'rating'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getFilterCategories(),
          getFilterBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveCategory = async () => {
      if (initialCategory) {
        setCategory(initialCategory);
        setIsCategoryLoading(false);
        setCategoryError(null);
        return;
      }

      setIsCategoryLoading(true);
      setCategoryError(null);

      try {
        const directMatch = await getCategoryBySlug(slug);

        if (isMounted && directMatch) {
          setCategory(directMatch);
          setIsCategoryLoading(false);
          return;
        }

        const allCategories = await getCategories();
        const fallback = allCategories.find((cat) => cat.slug?.toLowerCase() === slug.toLowerCase());

        if (isMounted && fallback) {
          setCategory(fallback);
        } else if (isMounted) {
          setCategory(null);
          setCategoryError('Category not found');
        }
      } catch (error) {
        console.error('Error resolving category:', error);
        if (isMounted) {
          setCategory(null);
          setCategoryError('Unable to load this category right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsCategoryLoading(false);
        }
      }
    };

    resolveCategory();

    return () => {
      isMounted = false;
    };
  }, [initialCategory, slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) {
        setProducts([]);
        return;
      }

      try {
        setIsLoading(true);
        const productsData = await productService.getProducts({
          category: category.id,
          ...(selectedBrand && { brand: selectedBrand }),
          ...(inStockOnly && { inStock: true }),
          sortBy: sortBy === 'price_low' ? 'price_asc' : sortBy === 'price_high' ? 'price_desc' : sortBy === 'newest' ? 'newest' : 'rating',
          limit: 100,
        });
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, selectedBrand, inStockOnly, sortBy]);

  // Filter products by price range
  const filteredProducts = products.filter((product) => {
    const price = product.price_range?.min || product.discount_price || product.original_price || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/categories" className="inline-flex items-center gap-2 text-[#00afef] hover:text-[#163b86] mb-4">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Categories</span>
          </Link>
          {isCategoryLoading ? (
            <div className="space-y-3">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : category ? (
            <>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-[#3A3A3A] text-sm sm:text-base">{category.description}</p>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Category not found</h2>
              <p className="text-[#3A3A3A] text-sm mb-4">
                {categoryError || 'We could not locate this category. It might have been moved or renamed.'}
              </p>
              <Link href="/shop">
                <Button variant="outline">Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-[#3A3A3A]">
            {isCategoryLoading ? 'Loading products...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filters Button - Mobile Only */}
            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              Filters
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00afef]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Toggle */}
            <div className="hidden sm:flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                icon={<Grid size={16} />}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                icon={<List size={16} />}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className={`hidden lg:block ${showFilters ? 'lg:block' : ''}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Filters</h3>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-sm text-[#1A1A1A] mb-3">Brand</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        value=""
                        checked={!selectedBrand}
                        onChange={() => setSelectedBrand(null)}
                        className="w-4 h-4 text-[#00afef]"
                      />
                      <span className="text-sm text-[#3A3A3A]">All Brands</span>
                    </label>
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="brand"
                          value={brand.id}
                          checked={selectedBrand === brand.id}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="w-4 h-4 text-[#00afef]"
                        />
                        <span className="text-sm text-[#3A3A3A]">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-[#00afef] rounded"
                  />
                  <span className="text-sm text-[#3A3A3A]">In Stock Only</span>
                </label>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm text-[#1A1A1A] mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ''}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-[#3A3A3A]">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] || ''}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters - Collapsible */}
          {showFilters && (
            <div className="lg:hidden mb-6 bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Filters</h3>
              
              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-[#1A1A1A] mb-2">Brand</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="brand-mobile"
                        value=""
                        checked={!selectedBrand}
                        onChange={() => setSelectedBrand(null)}
                        className="w-4 h-4 text-[#00afef]"
                      />
                      <span className="text-sm text-[#3A3A3A]">All Brands</span>
                    </label>
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="brand-mobile"
                          value={brand.id}
                          checked={selectedBrand === brand.id}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="w-4 h-4 text-[#00afef]"
                        />
                        <span className="text-sm text-[#3A3A3A]">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-[#00afef] rounded"
                  />
                  <span className="text-sm text-[#3A3A3A]">In Stock Only</span>
                </label>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {isCategoryLoading ? (
              <ProductListSkeleton count={12} />
            ) : isLoading ? (
              <ProductListSkeleton count={12} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-[#3A3A3A] text-sm mb-4">No products found in this category</p>
                <Link href="/shop">
                  <Button variant="outline">Browse All Products</Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={() => setQuickViewProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

