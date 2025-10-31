export interface SidebarAd {
  id: string;
  title?: string;
  image_url: string;
  link: string;
  position: 'left' | 'right' | 'both';
  show_on: string[];
  slider_group?: string;
  active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  // Product ad fields
  is_product_ad?: boolean;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  product_discount_price?: number;
  add_to_cart_enabled?: boolean;
}

export interface SidebarAdGroup {
  group_id: string;
  ads: SidebarAd[];
}


