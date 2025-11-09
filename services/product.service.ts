import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { calculatePriceRangesForProducts } from './priceRange.service';

const DEAL_PLACEHOLDER_IMAGE = '/placeholders/placeholder-product.webp';

const parseAmount = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const computeDiscountPercentage = (original: number | null, discounted: number | null): number => {
  if (!original || original <= 0 || discounted === null || discounted === undefined) {
    return 0;
  }
  const discount = Math.round(((original - discounted) / original) * 100);
  return Math.max(0, discount);
};

const normalizeImages = (primary?: string | null, gallery?: string[] | null): string[] => {
  const images: string[] = [];
  if (Array.isArray(gallery)) {
    for (const image of gallery) {
      if (typeof image === 'string' && image.trim()) {
        images.push(image.trim());
      }
    }
  }
  if (typeof primary === 'string' && primary.trim()) {
    images.unshift(primary.trim());
  }

  const unique = Array.from(new Set(images));
  return unique.length > 0 ? unique : [DEAL_PLACEHOLDER_IMAGE];
};

const parseKeyFeatures = (raw: string | string[] | null | undefined): string[] | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.filter((feature) => typeof feature === 'string' && feature.trim().length > 0);
  }

  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0);
    }
  } catch {
    // Ignore parse error and fallback
  }

  return trimmed
    .replace(/\r/g, '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseSpecifications = (raw: unknown): Product['specifications'] => {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Product['specifications'];
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Product['specifications'];
      }
      return raw;
    } catch {
      return raw;
    }
  }
  return {};
};

interface GetProductsParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  limit?: number;
  offset?: number;
}

// Fetch products with filters
export const getProducts = async (params: GetProductsParams = {}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories!products_category_id_fkey(id, name, slug),
        brands!products_brand_id_fkey(id, name, slug)
      `);

    // Apply filters
    if (params.category) {
      query = query.eq('category_id', params.category);
    }
    if (params.brand) {
      query = query.eq('brand_id', params.brand);
    }
    if (params.minPrice !== undefined) {
      query = query.gte('price', params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query = query.lte('price', params.maxPrice);
    }
    if (params.inStock !== undefined) {
      query = query.eq('in_stock', params.inStock);
    }
    if (params.featured !== undefined) {
      query = query.eq('is_featured', params.featured);
    }

    // Apply sorting
    switch (params.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products with relations:', error);
      
      // Fallback: Try fetching without explicit foreign key
      console.log('Attempting to fetch products with simple relations...');
      let fallbackQuery = supabase
        .from('products')
        .select(`
          *,
          categories:category_id(id, name, slug),
          brands:brand_id(id, name, slug)
        `);
      
      // Apply featured filter if provided
      if (params.featured !== undefined) {
        fallbackQuery = fallbackQuery.eq('is_featured', params.featured);
      }
      
      const { data: productsOnly, error: fallbackError } = await fallbackQuery
        .order('created_at', { ascending: false })
        .limit(params.limit || 50);
      
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        // Last resort: fetch without relations
        let basicQuery = supabase
          .from('products')
          .select('*');
        
        // Apply featured filter if provided
        if (params.featured !== undefined) {
          basicQuery = basicQuery.eq('is_featured', params.featured);
        }
        
        const { data: productsBasic } = await basicQuery
          .order('created_at', { ascending: false })
          .limit(params.limit || 50);
        
        return (productsBasic || []).map((p: any) => ({
          ...p,
          original_price: p.price,
          category_name: null,
          brand: p.brand_name || '',
          featured: p.is_featured || false,
        }));
      }
      
      console.log('Fetched products with simple relations:', productsOnly?.length || 0);
      return (productsOnly || []).map((p: any) => ({
        ...p,
        // Always use 'price' field from DB as original_price (source of truth)
        original_price: p.price || 0,
        category_name: p.categories?.name || p.category_name || null,
        category_slug: p.categories?.slug || p.category_slug || null,
        brand: p.brands?.name || p.brand || '',
        featured: p.is_featured || false,
      }));
    }
    
    // Transform products to ensure proper structure
    const transformedProducts = (data || []).map((product: any) => ({
      ...product,
      // Always use 'price' field from DB as original_price (source of truth)
      // Ignore product.original_price if it exists (it might be stale or wrong)
      original_price: product.price || 0,
      category_name: product.categories?.name || product.category_name || null,
      category_slug: product.categories?.slug || product.category_slug || null,
      brand: product.brands?.name || product.brand || '',
      featured: product.is_featured || false,
      // Remove nested objects that might cause issues
      categories: undefined,
      brands: undefined,
    }));
    
    // Calculate price ranges for products with variants
    const priceRanges = await calculatePriceRangesForProducts(transformedProducts);
    
    // Add price ranges to products
    const productsWithRanges = transformedProducts.map((product: any) => {
      const range = priceRanges.get(product.id);
      return {
        ...product,
        price_range: range || {
          min: product.discount_price || product.original_price || 0,
          max: product.discount_price || product.original_price || 0,
          hasRange: false,
        },
      };
    });
    
    console.log('Successfully fetched products with relations:', productsWithRanges.length);
    return productsWithRanges;
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }
};

// Fetch single product by slug
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    // Try with explicit foreign key names first
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!products_category_id_fkey(id, name, slug),
        brands!products_brand_id_fkey(id, name, slug)
      `)
      .eq('slug', slug)
      .single();

    // If that fails, try with automatic foreign key resolution
    if (error) {
      console.warn('First query failed, trying alternative query:', error);
      const result = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id(id, name, slug),
          brands:brand_id(id, name, slug)
        `)
        .eq('slug', slug)
        .single();
      
      data = result.data;
      error = result.error;
    }

    // If still fails, try without relations
    if (error) {
      console.warn('Second query failed, fetching without relations:', error);
      const result = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      
      data = result.data;
      error = result.error;
      
      // If we got data but no relations, fetch them separately
      if (data && !error) {
        const [categoryResult, brandResult] = await Promise.all([
          data.category_id ? supabase.from('categories').select('id, name, slug').eq('id', data.category_id).single() : { data: null },
          data.brand_id ? supabase.from('brands').select('id, name, slug').eq('id', data.brand_id).single() : { data: null },
        ]);
        
        data = {
          ...data,
          categories: categoryResult.data,
          brands: brandResult.data,
        };
      }
    }

    if (error || !data) {
      const fallbackDealProduct = await fetchDealProductFallback(slug);
      if (fallbackDealProduct) {
        return fallbackDealProduct;
      }

      if (error) {
        console.error('Error fetching product by slug:', error);
      }
      return null;
    }

    // Transform the data to match Product interface
    const product = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      key_features: data.key_features || null,
      specifications: data.specifications || null,
      category_id: data.category_id,
      brand: data.brands?.name || '',
      brand_id: data.brand_id || null,
      // Always use 'price' field from DB as original_price
      // The 'price' column is the source of truth (updated when products are saved)
      // Ignore data.original_price if it exists (it might be stale or wrong)
      original_price: data.price || 0,
      discount_price: data.discount_price || null,
      in_stock: data.in_stock,
      stock_quantity: data.stock_quantity || 0,
      images: data.images || [],
      thumbnail: data.thumbnail || '',
      featured: data.is_featured || false,
      rating: data.rating || 0,
      review_count: data.review_count ?? 0,
      specs: data.specs || {},
      variants: [], // TODO: Add variants if needed
      created_at: data.created_at,
      updated_at: data.updated_at,
      category_name: data.categories?.name || null,
      category_slug: data.categories?.slug || null,
      brand_name: data.brands?.name || null,
      brand_slug: data.brands?.slug || null
    };

    // Calculate price range for this product (with error handling)
    try {
      const basePrice = product.discount_price || product.original_price;
      const priceRange = await calculatePriceRangesForProducts([{
        id: product.id,
        original_price: product.original_price,
        discount_price: product.discount_price,
      }]);
      
      (product as any).price_range = priceRange.get(product.id) || {
        min: basePrice,
        max: basePrice,
        hasRange: false,
      };
    } catch (error) {
      console.error('Error calculating price range (skipping):', error);
      // Fallback: use base price
      const basePrice = product.discount_price || product.original_price;
      (product as any).price_range = {
        min: basePrice,
        max: basePrice,
        hasRange: false,
      };
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
};

// Fetch featured products
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('is_featured', true)
      .eq('in_stock', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Fetch similar products
export const getSimilarProducts = async (productId: string, categoryId: string, limit: number = 4): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('in_stock', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
};

// Search products
export const searchProducts = async (query: string, limit: number = 20): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('in_stock', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Delete product (admin only)
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Export as object for backward compatibility
export const productService = {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getSimilarProducts,
  searchProducts,
  deleteProduct,
};

const fetchDealProductFallback = async (slug: string): Promise<Product | null> => {
  if (!slug.startsWith('deal-')) {
    return null;
  }

  const dealProductId = slug.replace(/^deal-/, '').trim();
  if (!dealProductId) {
    return null;
  }

  const { data, error } = await supabase
    .from('deal_products')
    .select(`
      *,
      product:products(*),
      deal:deals(id, title, discount_percentage, start_date, end_date)
    `)
    .eq('id', dealProductId)
    .maybeSingle();

  if (error || !data) {
    return null;
    }

  return buildProductFromDealRecord(data, slug);
};

const buildProductFromDealRecord = (record: any, slug: string): Product | null => {
  if (!record) return null;

  const dealLevelDiscount =
    parseInteger(record.discount_percentage) ?? parseInteger(record.deal?.discount_percentage) ?? 0;

  if (record.product) {
    const productRecord = record.product as Product & Record<string, any>;
    const originalPrice =
      parseAmount(productRecord.price) ??
      parseAmount(productRecord.original_price) ??
      0;
    const productDiscountPrice = parseAmount(productRecord.discount_price);
    const explicitDealPrice = parseAmount(record.deal_price);
    const overrideDiscount = parseInteger(record.discount_percentage);
    const computedDealPrice =
      explicitDealPrice ??
      (overrideDiscount && originalPrice
        ? Number((originalPrice * (1 - overrideDiscount / 100)).toFixed(2))
        : null) ??
      (dealLevelDiscount && originalPrice
        ? Number((originalPrice * (1 - dealLevelDiscount / 100)).toFixed(2))
        : null) ??
      productDiscountPrice ??
      originalPrice;

    const finalDealPrice = Number((computedDealPrice ?? originalPrice).toFixed(2));
    const effectiveDiscount =
      overrideDiscount ??
      computeDiscountPercentage(originalPrice, finalDealPrice) ??
      dealLevelDiscount;

    const stockQuantity =
      parseInteger(productRecord.stock_quantity) ?? 0;
    const images = normalizeImages(productRecord.thumbnail, productRecord.images);

    const transformed: Product = {
      ...productRecord,
      slug,
      original_price: originalPrice,
      discount_price: finalDealPrice,
      stock_quantity: stockQuantity,
      in_stock: stockQuantity > 0 ? true : Boolean(productRecord.in_stock),
      thumbnail: images[0],
      images,
      price_range: productRecord.price_range ?? {
        min: finalDealPrice,
        max: originalPrice || finalDealPrice,
        hasRange: false,
      },
      base_product_id: productRecord.id,
    };

    (transformed as any).deal_price = finalDealPrice;
    (transformed as any).deal_discount = effectiveDiscount;

    return transformed;
  }

  if (!record.product_name) {
    return null;
  }

  const standaloneOriginalPrice =
    parseAmount(record.original_price) ?? 0;
  const explicitDealPrice = parseAmount(record.deal_price);
  const overrideDiscount = parseInteger(record.discount_percentage);
  const computedStandaloneDealPrice =
    explicitDealPrice ??
    (overrideDiscount && standaloneOriginalPrice
      ? Number((standaloneOriginalPrice * (1 - overrideDiscount / 100)).toFixed(2))
      : null) ??
    (dealLevelDiscount && standaloneOriginalPrice
      ? Number((standaloneOriginalPrice * (1 - dealLevelDiscount / 100)).toFixed(2))
      : null) ??
    standaloneOriginalPrice;

  const finalStandaloneDealPrice = Number(
    (computedStandaloneDealPrice ?? standaloneOriginalPrice).toFixed(2)
  );
  const effectiveStandaloneDiscount =
    overrideDiscount ??
    computeDiscountPercentage(standaloneOriginalPrice, finalStandaloneDealPrice) ??
    dealLevelDiscount;

  const standaloneImages = normalizeImages(record.product_image_url, record.product_images);
  const standaloneStock = parseInteger(record.stock_quantity) ?? 0;
  const keyFeatures = parseKeyFeatures(record.product_key_features);
  const specifications = parseSpecifications(record.product_specifications);
  const timestamp = record.created_at || new Date().toISOString();

  const standaloneProduct: Product = {
    id: record.id,
    name: record.product_name,
    slug,
    description: record.product_description || '',
    key_features: keyFeatures,
    specifications,
    category_id: record.product?.category_id || 'standalone',
    brand: record.product?.brand || 'VENTECH Deals',
    brand_id: record.product?.brand_id || null,
    original_price: standaloneOriginalPrice || finalStandaloneDealPrice,
    discount_price: finalStandaloneDealPrice,
    in_stock: standaloneStock > 0,
    stock_quantity: standaloneStock,
    images: standaloneImages,
    thumbnail: standaloneImages[0] || DEAL_PLACEHOLDER_IMAGE,
    featured: false,
    rating: 0,
    review_count: 0,
    specs:
      (typeof specifications === 'object' && !Array.isArray(specifications)
        ? (specifications as Product['specs'])
        : {}) as Product['specs'],
    variants: [],
    created_at: timestamp,
    updated_at: timestamp,
    category_name: record.product?.category_name || null,
    category_slug: record.product?.category_slug || null,
    brand_name: record.product?.brand_name || 'VENTECH Deals',
    brand_slug: record.product?.brand_slug || null,
    base_product_id: record.product_id || record.id,
    price_range: {
      min: finalStandaloneDealPrice,
      max: standaloneOriginalPrice || finalStandaloneDealPrice,
      hasRange: false,
    },
  };

  (standaloneProduct as any).deal_price = finalStandaloneDealPrice;
  (standaloneProduct as any).deal_discount = effectiveStandaloneDiscount;

  return standaloneProduct;
};
