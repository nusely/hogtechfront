import { supabase } from '@/lib/supabase';
import { Category } from '@/types/product';

// Fetch all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Supabase error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch categories for filters (active, with products)
export const getFilterCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .gt('product_count', 0)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching filter categories:', error);
    return [];
  }
};

// Fetch category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, thumbnail, icon, parent_id, product_count, order, created_at')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching category:', {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
      });
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching category (exception):', error);
    return null;
  }
};


