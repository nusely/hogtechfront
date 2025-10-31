export interface MegaMenuItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  badge?: {
    text: string;
    color: string;
  };
  image?: string;
  children?: MegaMenuItem[];
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuCategory {
  id: string;
  title: string;
  slug: string;
  image?: string;
  icon?: string;
  columns: MegaMenuColumn[];
  featured?: {
    title: string;
    image: string;
    link: string;
  };
}

// Mock data structure for mega menu
export const megaMenuData: MegaMenuCategory[] = [
  {
    id: 'phones',
    title: 'Phones',
    icon: 'Smartphone',
    columns: [
      {
        title: 'Shop by Type',
        items: [
          { id: '1', title: 'Smartphones', href: '/categories/smartphones' },
          { id: '2', title: 'Feature Phones', href: '/categories/feature-phones' },
          { id: '3', title: 'Tablets', href: '/categories/tablets' },
        ],
      },
      {
        title: 'Popular Brands',
        items: [
          { id: '4', title: 'Apple', href: '/brand/apple' },
          { id: '5', title: 'Samsung', href: '/brand/samsung' },
          { id: '6', title: 'Xiaomi', href: '/brand/xiaomi' },
          { id: '7', title: 'Tecno', href: '/brand/tecno' },
          { id: '8', title: 'Infinix', href: '/brand/infinix' },
        ],
      },
      {
        title: 'By Specs',
        items: [
          { id: '9', title: '4GB RAM', href: '/shop?ram=4gb' },
          { id: '10', title: '8GB RAM', href: '/shop?ram=8gb' },
          { id: '11', title: '128GB Storage', href: '/shop?storage=128gb' },
          { id: '12', title: '256GB Storage', href: '/shop?storage=256gb' },
        ],
      },
    ],
    featured: {
      title: 'Hot Deals on Phones',
      image: '/banners/store2-home-pic2.webp',
      link: '/deals?category=phones',
    },
  },
  {
    id: 'computers',
    title: 'Computers',
    icon: 'Laptop',
    columns: [
      {
        title: 'Laptops',
        items: [
          { id: '13', title: 'Gaming Laptops', href: '/categories/gaming-laptops' },
          { id: '14', title: 'Business Laptops', href: '/categories/business-laptops' },
          { id: '15', title: 'Ultrabooks', href: '/categories/ultrabooks' },
          { id: '16', title: 'MacBooks', href: '/categories/macbooks' },
        ],
      },
      {
        title: 'Desktops',
        items: [
          { id: '17', title: 'Gaming PCs', href: '/categories/gaming-pcs' },
          { id: '18', title: 'All-in-One', href: '/categories/all-in-one' },
          { id: '19', title: 'Workstations', href: '/categories/workstations' },
        ],
      },
      {
        title: 'Accessories',
        items: [
          { id: '20', title: 'Monitors', href: '/categories/monitors' },
          { id: '21', title: 'Keyboards', href: '/categories/keyboards' },
          { id: '22', title: 'Mice', href: '/categories/mice' },
        ],
      },
    ],
    featured: {
      title: 'Back to School Deals',
      image: '/banners/store2-home-pic3.webp',
      link: '/deals?category=computers',
    },
  },
  {
    id: 'accessories',
    title: 'Accessories',
    icon: 'Headphones',
    columns: [
      {
        title: 'Audio',
        items: [
          { id: '23', title: 'Headphones', href: '/categories/headphones' },
          { id: '24', title: 'Earbuds', href: '/categories/earbuds' },
          { id: '25', title: 'Speakers', href: '/categories/speakers' },
        ],
      },
      {
        title: 'Power',
        items: [
          { id: '26', title: 'Power Banks', href: '/categories/power-banks' },
          { id: '27', title: 'Chargers', href: '/categories/chargers' },
          { id: '28', title: 'Cables', href: '/categories/cables' },
        ],
      },
      {
        title: 'Protection',
        items: [
          { id: '29', title: 'Phone Cases', href: '/categories/phone-cases' },
          { id: '30', title: 'Screen Protectors', href: '/categories/screen-protectors' },
          { id: '31', title: 'Laptop Bags', href: '/categories/laptop-bags' },
        ],
      },
    ],
  },
  {
    id: 'smartwatches',
    title: 'Smartwatches',
    icon: 'Watch',
    columns: [
      {
        title: 'By Brand',
        items: [
          { id: '32', title: 'Apple Watch', href: '/brand/apple-watch' },
          { id: '33', title: 'Samsung Galaxy Watch', href: '/brand/samsung-watch' },
          { id: '34', title: 'Fitbit', href: '/brand/fitbit' },
          { id: '35', title: 'Amazfit', href: '/brand/amazfit' },
        ],
      },
      {
        title: 'By Feature',
        items: [
          { id: '36', title: 'Fitness Tracking', href: '/shop?feature=fitness' },
          { id: '37', title: 'GPS', href: '/shop?feature=gps' },
          { id: '38', title: 'Heart Rate Monitor', href: '/shop?feature=heart-rate' },
        ],
      },
    ],
  },
];


