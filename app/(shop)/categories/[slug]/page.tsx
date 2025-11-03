'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/cards/ProductCard';
import { ProductListSkeleton } from '@/components/loaders/ProductCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Product, Category, ProductFilter } from '@/types/product';
import { getProducts } from '@/services/product.service';
import { getCategoryBySlug } from '@/services/category.service';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilter>({
    category: '',
    sortBy: 'newest',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug, filters, pagination.page]);

  const fetchCategoryAndProducts = async () => {
    try {
      setIsLoading(true);

      // Fetch category
      const categoryData = await getCategoryBySlug(slug);
      if (!categoryData) {
        toast.error('Category not found');
        return;
      }
      setCategory(categoryData);

      // Fetch products for this category
      const productsData = await getProducts({
        category: categoryData.id,
        sortBy: filters.sortBy as any,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
      });

      setProducts(productsData);
      setPagination({
        ...pagination,
        total: productsData.length,
        totalPages: Math.ceil(productsData.length / pagination.limit),
      });
    } catch (error: any) {
      console.error('Error fetching category products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sortBy: string) => {
    setFilters({ ...filters, sortBy: sortBy as any });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-blue-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category?.name || slug}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <Link href="/categories">
            <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} className="mb-4">
              Back to Categories
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'product' : 'products'} found
          </p>

          <div className="flex items-center gap-4">
            {/* Sort dropdown - hidden on mobile */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="hidden md:block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filters button - visible on all screens, icon only on mobile */}
            <Button variant="outline" size="sm" icon={<SlidersHorizontal size={16} />} className="md:flex md:items-center md:gap-2">
              <span className="hidden md:inline">Filters</span>
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductListSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No products found in this category</p>
            <Link href="/categories">
              <Button variant="primary">Browse Other Categories</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

