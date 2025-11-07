// App Configuration
export const APP_NAME = 'VENTECH';
export const APP_DESCRIPTION =
  'A modern online tech store providing high-quality electronics and gadgets at competitive prices.';

// Brand Colors (VENTECH Theme)
export const COLORS = {
  primary: '#FF7A19', // Primary Orange
  secondary: '#FF7A19', // Primary Orange
  accent: '#FF7A19', // Primary Orange
  success: '#10b981',
  error: '#ef4444',
  warning: '#FF7A19',
  dark: '#1A1A1A', // Deep Black
  darkGray: '#3A3A3A', // Neutral Dark Gray
  light: '#FFFFFF', // Soft White
  gray: '#EDEDED', // Cool Gray
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'Smartphone',
  },
  {
    id: 'laptops',
    name: 'Laptops',
    slug: 'laptops',
    icon: 'Laptop',
  },
  {
    id: 'tablets',
    name: 'Tablets',
    slug: 'tablets',
    icon: 'Tablet',
  },
  {
    id: 'smartwatches',
    name: 'Smartwatches',
    slug: 'smartwatches',
    icon: 'Watch',
  },
  {
    id: 'headphones',
    name: 'Headphones',
    slug: 'headphones',
    icon: 'Headphones',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'Cable',
  },
  {
    id: 'home-devices',
    name: 'Home Devices',
    slug: 'home-devices',
    icon: 'Home',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming',
    icon: 'Gamepad2',
  },
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  CUSTOMER: 'customer',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  CARD: 'card',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

// Delivery Options
export const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: '5-7 business days',
    price: 0,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: '2-3 business days',
    price: 15,
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Next business day',
    price: 30,
  },
];

// Warranty Options
export const WARRANTY_OPTIONS = [
  { id: 'none', name: 'No Warranty', price: 0 },
  { id: '1year', name: '1 Year Warranty', price: 50 },
  { id: '2year', name: '2 Year Warranty', price: 100 },
  { id: '3year', name: '3 Year Extended Warranty', price: 150 },
];

// Pagination
export const ITEMS_PER_PAGE = 12;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  CART: '/cart',
  USERS: '/users',
  BANNERS: '/banners',
};

