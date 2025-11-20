/**
 * SEO Configuration File
 * 
 * Edit this file to customize SEO settings for your business.
 * All SEO metadata across the site will use these settings.
 */

export const seoConfig = {
  // Business Information
  business: {
    name: 'Hedgehog Technologies',
    fullName: 'Hedgehog Technologies',
    tagline: 'The Only Limit is Your Imagination',
    description: 'Hedgehog Technologies is your one-stop tech partner in Weija, Accra, Ghana. We offer the latest gadgets, smartphones, laptops, and electronics, plus professional services including laptop repairs, computer repairs, software installation, hardware upgrades, data recovery, virus removal, and phone repairs. Located on Oblogo Road in Greater Accra, we serve customers nationwide with authentic products, expert repairs, best prices, and exceptional service. Visit our store in Weija or shop online for fast delivery across Ghana.',
    email: 'hedgehog.technologies1@gmail.com',
    phone: '+233 553 886 5804',
    location: {
      street: 'Oblogo Road',
      neighborhood: 'Weija',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      address: 'Oblogo Road, Weija, Greater Accra, Ghana',
      coordinates: {
        latitude: 5.5575211, // Approximate Weija coordinates
        longitude: -0.3079048,
      },
    },
    operatingRegions: ['Ghana', 'West Africa', 'Accra', 'Kumasi', 'Tema', 'Takoradi'],
    operatingHours: 'Monday - Saturday: 8:00 AM - 6:00 PM',
  },

  // Website Information
  website: {
    url: 'https://ventechgadgets.com', // Update with your actual domain
    defaultImage: '/og-image.jpg', // Add an OG image
    twitterHandle: '@ventechgadgets',
    facebookPage: 'https://facebook.com/ventechgadgets',
  },

  // SEO Keywords (Primary and Secondary)
  keywords: {
    primary: [
      'gadgets Ghana',
      'electronics Accra',
      'tech store Ghana',
      'laptop repair Ghana',
      'computer repair Accra',
      'smartphones Ghana',
      'laptops Accra',
      'software installation Ghana',
      'buy gadgets online Ghana',
      'tech services Weija',
      'electronics store Accra',
      'phone repair Ghana',
      'hardware upgrades Ghana',
      'data recovery Ghana',
    ],
    secondary: [
      'tech store Weija',
      'laptop repair Weija',
      'computer repair Greater Accra',
      'electronics shop Oblogo road',
      'virus removal Ghana',
      'laptop screen replacement Ghana',
      'MacBook repair Ghana',
      'PC repair Accra',
      'phone screen replacement',
      'West Africa gadgets',
      'online electronics store',
      'genuine gadgets Ghana',
      'tech products Accra',
      'smartphones West Africa',
      'tablets Ghana',
      'smartwatches Ghana',
      'accessories Ghana',
      'tech deals Ghana',
      'electronics delivery Ghana',
      'same day laptop repair',
      'hedgehog technologies',
      'hedgehog technologies Ghana',
      'hedgehog technologies Weija',
    ],
  },

  // Page-Specific SEO
  pages: {
    homepage: {
      title: 'Hedgehog Technologies - Best Gadgets, Electronics & Laptop Repairs in Weija, Accra | Shop & Repair Ghana',
      description: 'Your one-stop tech partner in Weija, Accra! Shop latest gadgets, smartphones, laptops & electronics. Professional services: laptop repairs, computer repairs, software installation, hardware upgrades, data recovery, phone repairs. Located on Oblogo Road, Greater Accra. Best prices, expert technicians, authentic products, fast nationwide delivery. The only limit is your imagination! Serving Accra, Kumasi, Tema & all Ghana.',
      keywords: 'gadgets Ghana, electronics Accra, tech store Weija, laptop repair Ghana, computer repair Accra, smartphones Ghana, software installation Ghana, hardware upgrades, phone repair, data recovery, electronics shop Oblogo road, tech services Greater Accra, buy gadgets online Ghana, laptop screen replacement, virus removal Ghana, tech repairs Weija, best tech prices Ghana',
    },
    shop: {
      title: 'Shop All Tech Products - Gadgets, Laptops & Electronics | Hedgehog Technologies Weija, Accra',
      description: 'Browse our complete collection of gadgets, smartphones, laptops, tablets, smartwatches, and tech accessories at Hedgehog Technologies, Oblogo Road, Weija, Accra. Authentic products from top brands, best prices in Ghana, expert advice, and fast nationwide delivery to Accra, Kumasi, Tema & all regions.',
      keywords: 'shop gadgets Ghana, buy electronics Accra, tech products Weija, smartphones Ghana, laptops Accra, tablets Ghana, smartwatches Ghana, accessories Oblogo road, electronics store Greater Accra, buy tech online Ghana, gadget shopping Weija',
    },
    deals: {
      title: 'Hot Deals & Discounts - Hedgehog Technologies Ghana',
      description: 'Don\'t miss our amazing deals on smartphones, laptops, gadgets, and electronics. Limited time offers with the best prices in Ghana. Shop now and save!',
      keywords: 'gadget deals Ghana, electronics discounts, smartphone deals Ghana, laptop sales Ghana, tech offers Ghana, electronics promotions, gadget sales Accra',
    },
    about: {
      title: 'About Us - Hedgehog Technologies | Your Trusted Tech Partner in Ghana',
      description: 'Hedgehog Technologies is Ghana\'s trusted technology store. We provide authentic gadgets, smartphones, laptops, and electronics with exceptional service. Serving customers nationwide in Ghana and across West Africa since our founding.',
      keywords: 'about hedgehog technologies, hedgehog technologies Ghana, tech store Accra, electronics store Ghana, trusted gadget store, technology partner Ghana',
    },
    contact: {
      title: 'Contact Us - Hedgehog Technologies Ghana | Get in Touch',
      description: 'Contact Hedgehog Technologies for inquiries, support, or orders. Located in Weija, Oblogo Road, Greater Accra, Ghana. Call +233 553 886 5804 or email hedgehog.technologies1@gmail.com. We\'re here to help!',
      keywords: 'contact hedgehog technologies, hedgehog technologies Ghana contact, electronics store contact Weija, gadget store Accra, tech support Ghana, Oblogo road contact',
    },
    services: {
      title: 'Professional Tech Services - Laptop Repairs, Software Installation & Support | Hedgehog Technologies Ghana',
      description: 'Expert tech services in Weija, Accra: Laptop & computer repairs, software installation, hardware upgrades, data recovery, virus removal, phone repairs. Same-day service available. Professional technicians serving Greater Accra, Kumasi, Tema & all Ghana. Best prices, quality guarantee.',
      keywords: 'laptop repair Ghana, computer repair Accra, laptop repair Weija, software installation Ghana, hardware upgrade Accra, phone repair Ghana, data recovery Ghana, virus removal Accra, MacBook repair Ghana, PC repair Weija, screen replacement Ghana, battery replacement Accra, tech services Greater Accra, computer technician Ghana, same day laptop repair',
    },
    register: {
      title: 'Create Account - Hedgehog Technologies Ghana',
      description: 'Create your Hedgehog Technologies account to shop gadgets, track orders, save addresses, and enjoy exclusive deals. Sign up now for free and start shopping the latest tech!',
      keywords: 'register hedgehog technologies, create account Ghana, sign up electronics store, gadget store account, hedgehog technologies registration',
    },
  },

  // Category SEO Templates
  category: {
    title: '{category} in Ghana - Buy {category} Online | Hedgehog Technologies',
    description: 'Shop {category} in Ghana. Authentic products, best prices, nationwide delivery. Browse our collection of {category} with genuine products from trusted brands.',
    keywords: '{category} Ghana, buy {category} online Ghana, {category} Accra, {category} prices Ghana, {category} store Ghana',
  },

  // Product SEO Templates
  product: {
    title: '{name} - Buy in Ghana | Hedgehog Technologies',
    description: 'Buy {name} in Ghana. {brand} {name} with authentic guarantee, best price, and nationwide delivery. Shop now at Hedgehog Technologies!',
    keywords: '{name} Ghana, buy {name} Ghana, {brand} {name}, {name} price Ghana, {name} Accra, {category} Ghana',
  },
};

/**
 * Generate page title with site name
 */
export const getPageTitle = (title: string): string => {
  return `${title} | ${seoConfig.business.fullName}`;
};

/**
 * Generate category SEO metadata
 */
export const getCategorySEO = (categoryName: string, slug: string) => {
  const title = seoConfig.category.title
    .replace('{category}', categoryName);
  
  const description = seoConfig.category.description
    .replace(/{category}/g, categoryName);
  
  const keywords = seoConfig.category.keywords
    .replace(/{category}/g, categoryName.toLowerCase());

  return {
    title: getPageTitle(title),
    description,
    keywords,
  };
};

/**
 * Generate product SEO metadata
 */
export const getProductSEO = (product: {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
}) => {
  const brand = product.brand || '';
  const category = product.category || 'gadgets';
  
  const title = seoConfig.product.title
    .replace('{name}', product.name)
    .replace('{brand}', brand);
  
  const description = product.description || seoConfig.product.description
    .replace('{name}', product.name)
    .replace('{brand}', brand);
  
  const keywords = seoConfig.product.keywords
    .replace(/{name}/g, product.name)
    .replace(/{brand}/g, brand)
    .replace(/{category}/g, category.toLowerCase());

  return {
    title: getPageTitle(title),
    description,
    keywords,
  };
};

/**
 * Generate structured data (JSON-LD) for SEO
 */
export const generateStructuredData = (type: 'Organization' | 'WebSite' | 'Product' | 'BreadcrumbList', data?: any) => {
  const baseUrl = seoConfig.website.url;
  const business = seoConfig.business;

  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: business.fullName,
        legalName: business.fullName,
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: business.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: business.location.city,
          addressRegion: business.location.region,
          addressCountry: business.location.country,
          streetAddress: business.location.address,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: business.phone,
          contactType: 'Customer Service',
          email: business.email,
          areaServed: business.operatingRegions,
        },
        sameAs: [
          seoConfig.website.facebookPage,
        ],
      };

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: business.fullName,
        url: baseUrl,
        description: business.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };

    case 'Product':
      if (!data) return null;
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description || `${data.name} - Buy in Ghana at Hedgehog Technologies`,
        image: data.images || [],
        brand: {
          '@type': 'Brand',
          name: data.brand || 'Hedgehog Technologies',
        },
        category: data.category,
        offers: {
          '@type': 'Offer',
          price: data.price || data.original_price || 0,
          priceCurrency: 'GHS',
          availability: data.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: business.fullName,
          },
          url: `${baseUrl}/product/${data.slug}`,
        },
      };

    case 'BreadcrumbList':
      if (!data?.items) return null;
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`,
        })),
      };

    default:
      return null;
  }
};


