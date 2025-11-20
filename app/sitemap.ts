import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.website.url;

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Fetch dynamic pages (products, categories) from API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hogtechfront-hps398am6-batista-simons-projects.vercel.app';
    
    // Fetch products
    const productsRes = await fetch(`${apiUrl}/api/products?limit=1000`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    let productPages: any[] = [];
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = productsData.data || [];
      
      productPages = products.map((product: any) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(product.updated_at || product.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    // Fetch categories
    const categoriesRes = await fetch(`${apiUrl}/api/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    let categoryPages: any[] = [];
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      
      categoryPages = (categories || []).map((category: any) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category.updated_at || category.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    console.log(`Generated sitemap with ${productPages.length} products and ${categoryPages.length} categories`);
    return [...staticPages, ...productPages, ...categoryPages];
    
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    // Return static pages as fallback
    return staticPages;
  }
}
