import { Metadata } from 'next';
import Script from 'next/script';
import { seoConfig, generateStructuredData } from '@/lib/seo.config';
import ServicesContent from './ServicesContent';

export const metadata: Metadata = {
  title: 'Our Services - Laptop Repairs, Software Installation & Tech Support in Ghana | Hedgehog Technologies',
  description: 'Professional tech services in Weija, Accra: Laptop & computer repairs, software installation, hardware upgrades, data recovery, virus removal, phone repairs, and technical support. Expert technicians serving Greater Accra, Ghana. Same-day service available.',
  keywords: 'laptop repair Ghana, computer repair Accra, software installation Ghana, hardware upgrade Weija, phone repair Accra, data recovery Ghana, virus removal, tech support Greater Accra, laptop screen replacement, MacBook repair Ghana, PC repair services, tech services Weija',
  openGraph: {
    title: 'Professional Tech Services - Repairs, Software & Support | Hedgehog Technologies Ghana',
    description: 'Expert laptop repairs, software installation, hardware upgrades & technical support in Weija, Accra. Fast, reliable, affordable tech services across Ghana.',
    type: 'website',
    locale: 'en_GH',
    url: `${seoConfig.website.url}/services`,
    siteName: seoConfig.business.fullName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Tech Services in Ghana | Hedgehog Technologies',
    description: 'Laptop repairs, software installation, hardware upgrades & more. Expert tech services in Weija, Accra.',
  },
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
  // Generate Local Business structured data
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${seoConfig.website.url}#business`,
    name: seoConfig.business.fullName,
    description: seoConfig.business.description,
    url: seoConfig.website.url,
    telephone: seoConfig.business.phone,
    email: seoConfig.business.email,
    priceRange: '₵₵',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Oblogo Road',
      addressLocality: 'Weija',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.5575211,
      longitude: -0.3079048,
    },
    areaServed: [
      { '@type': 'City', name: 'Accra' },
      { '@type': 'City', name: 'Weija' },
      { '@type': 'City', name: 'Tema' },
      { '@type': 'City', name: 'Kumasi' },
      { '@type': 'State', name: 'Greater Accra Region' },
      { '@type': 'Country', name: 'Ghana' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tech Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Laptop & Computer Repair',
            description: 'Professional laptop and computer repair services including hardware replacement, screen repair, motherboard repair, and diagnostics',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Software Installation & Configuration',
            description: 'Operating system installation, software setup, driver updates, and system optimization',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Hardware Upgrades',
            description: 'RAM upgrades, SSD installation, graphics card replacement, and component upgrades',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Data Recovery & Backup',
            description: 'Professional data recovery from damaged drives, backup solutions, and data migration',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Virus & Malware Removal',
            description: 'Complete system cleaning, virus removal, malware protection, and security setup',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Phone & Tablet Repair',
            description: 'Smartphone screen replacement, battery replacement, charging port repair, and software fixes',
          },
        },
      ],
    },
  };

  const breadcrumbData = {
    items: [
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
    ],
  };
  const breadcrumbSchema = generateStructuredData('BreadcrumbList', breadcrumbData);

  return (
    <>
      {/* Local Business Schema */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      
      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema-services"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      )}
      
      <ServicesContent />
    </>
  );
}

