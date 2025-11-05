import { supabase } from '@/lib/supabase';
import { DeliveryOption } from '@/types/order';

export const deliveryOptionsService = {
  // Get all active delivery options for public use
  async getActiveDeliveryOptions(): Promise<DeliveryOption[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      console.log('Raw delivery options from database:', data);
      
      const normalizedOptions = (data || []).map((option: any) => {
        // Normalize type: handle NULL, empty string, or invalid values
        let normalizedType = (option.type || '').trim().toLowerCase();
        if (normalizedType !== 'delivery' && normalizedType !== 'pickup') {
          console.warn(`Delivery option "${option.name}" has invalid type: "${option.type}". Defaulting to "delivery".`);
          normalizedType = 'delivery'; // Default to delivery if invalid
        }
        
        const normalized = {
          id: option.id,
          name: option.name,
          description: option.description || '',
          price: parseFloat(option.price) || 0,
          type: normalizedType as 'delivery' | 'pickup',
          estimated_days: option.estimated_days || undefined,
        };
        
        console.log(`Normalized option: ${normalized.name} (type: ${normalized.type}, active: ${option.is_active})`);
        return normalized;
      });
      
      console.log('Normalized delivery options:', normalizedOptions);
      return normalizedOptions;
    } catch (error: any) {
      console.error('Error fetching active delivery options:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      
      // Don't return hardcoded defaults - return empty array
      // Admin must create delivery options in the admin panel
      console.warn('No delivery options available from database. Please create delivery options in admin panel.');
      return [];
    }
  },

  // Get all delivery options (including inactive) for admin
  async getAllDeliveryOptions(): Promise<any[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((option: any) => ({
        id: option.id,
        name: option.name,
        description: option.description || '',
        price: parseFloat(option.price) || 0,
        type: option.type || 'delivery', // Default to delivery if type not set
        estimated_days: option.estimated_days || null,
        is_active: option.is_active !== false,
        display_order: option.display_order || 0,
        created_at: option.created_at,
        updated_at: option.updated_at,
      }));
    } catch (error: any) {
      console.error('Error fetching all delivery options:', error);
      throw error;
    }
  },

  // Create a new delivery option
  async createDeliveryOption(option: {
    name: string;
    description?: string;
    price: number;
    type?: 'delivery' | 'pickup';
    estimated_days?: number;
    is_active?: boolean;
    display_order?: number;
  }): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('delivery_options')
        .insert({
          name: option.name,
          description: option.description || null,
          price: option.price,
          type: option.type || 'delivery', // Default to delivery if not specified
          estimated_days: option.estimated_days || null,
          is_active: option.is_active !== false,
          display_order: option.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating delivery option:', error);
      throw error;
    }
  },

  // Update a delivery option
  async updateDeliveryOption(
    id: string,
    updates: {
      name?: string;
      description?: string;
      price?: number;
      type?: 'delivery' | 'pickup';
      estimated_days?: number;
      is_active?: boolean;
      display_order?: number;
    }
  ): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.estimated_days !== undefined) updateData.estimated_days = updates.estimated_days || null;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.display_order !== undefined) updateData.display_order = updates.display_order;

      const { data, error } = await supabase
        .from('delivery_options')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating delivery option:', error);
      throw error;
    }
  },

  // Delete a delivery option
  async deleteDeliveryOption(id: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('delivery_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting delivery option:', error);
      throw error;
    }
  },
};

