import { supabase } from '@/lib/supabase';
import { Banner } from '@/types/banner';

export const bannerService = {
  // Get active banners by type
  async getBannersByType(type: string) {
    const currentDate = new Date().toISOString();

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('type', type)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Get hero banners
  async getHeroBanners() {
    return this.getBannersByType('hero');
  },

  // Get sidebar banners
  async getSidebarBanners() {
    return this.getBannersByType('sidebar');
  },

  // Get all banners (Admin)
  async getAllBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Create banner (Admin)
  async createBanner(banner: Partial<Banner>) {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Update banner (Admin)
  async updateBanner(id: string, updates: Partial<Banner>) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Delete banner (Admin)
  async deleteBanner(id: string) {
    const { error } = await supabase.from('banners').delete().eq('id', id);

    if (error) throw error;
  },

  // Upload banner image
  async uploadImage(file: File, bannerId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bannerId}-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('banners').getPublicUrl(filePath);

    return publicUrl;
  },
};


