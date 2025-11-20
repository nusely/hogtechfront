'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Tag,
  Image,
  BarChart3,
  Settings,
  Bell,
  CreditCard,
  Heart,
  ShoppingCart,
  Star,
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

// Manual Content Data
const manualSections = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'The central hub for monitoring your store\'s performance.',
    features: [
      'Real-time overview of total revenue, orders, customers, and average order value.',
      'Visual charts for sales trends and revenue over time.',
      'Quick access to recent orders and top-selling products.',
      'Alerts for low stock and pending orders.'
    ],
    howTo: [
      {
        title: 'View Daily Stats',
        steps: ['Check the top cards for today\'s key metrics.', 'Compare with previous periods using the percentage indicators.']
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    description: 'Detailed insights into your business performance.',
    subsections: [
      {
        id: 'revenue',
        title: 'Revenue Analytics',
        content: 'Track your income streams. View gross and net revenue, identify peak sales periods, and download reports.'
      },
      {
        id: 'sales',
        title: 'Sales Analytics',
        content: 'Analyze product sales performance. See which items are bestsellers and which are underperforming.'
      },
      {
        id: 'customers',
        title: 'Customer Analytics',
        content: 'Understand your customer base. Track new vs. returning customers and demographic data if available.'
      }
    ]
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: ShoppingBag,
    description: 'Manage customer orders from placement to fulfillment.',
    features: [
      'View all orders with status (Pending, Processing, Completed, Cancelled).',
      'Filter orders by status, date, or customer.',
      'Update order status and send automatic email notifications.',
      'Print invoices and packing slips.'
    ],
    howTo: [
      {
        title: 'Process an Order',
        steps: [
          'Click on an order ID to view details.',
          'Verify payment and shipping information.',
          'Change status to "Processing" while preparing.',
          'Once shipped, update status to "Completed" (or "Shipped") and add tracking info if applicable.'
        ]
      }
    ]
  },
  {
    id: 'products',
    title: 'Products',
    icon: Package,
    description: 'Manage your product catalog.',
    subsections: [
      {
        id: 'all-products',
        title: 'All Products',
        content: 'Add, edit, or delete products. Manage inventory, prices, and images. Set products as "Featured" or "On Sale".'
      },
      {
        id: 'categories',
        title: 'Categories',
        content: 'Organize products into categories (e.g., Laptops, Phones) to help customers browse.'
      },
      {
        id: 'brands',
        title: 'Brands',
        content: 'Manage product brands. Useful for filtering and brand-specific promotions.'
      }
    ],
    howTo: [
      {
        title: 'Add a New Product',
        steps: [
          'Go to Products > All Products.',
          'Click "Add New Product".',
          'Fill in details: Name, Description, Price, Stock.',
          'Upload high-quality images.',
          'Assign Category and Brand.',
          'Click "Save Product".'
        ]
      }
    ]
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    description: 'View and manage your registered users and guest customers.',
    features: [
      'List of all customers with contact info and order history.',
      'View individual customer profiles.',
      'Track total spend and last order date.'
    ]
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: CreditCard,
    description: 'Monitor all financial transactions.',
    features: [
      'Log of all payments (Cash, Mobile Money, Card, Paystack).',
      'Status of each transaction (Paid, Pending, Failed).',
      'Link back to associated orders.'
    ],
    howTo: [
      {
        title: 'Verify a Payment',
        steps: [
          'Locate the transaction by ID or Order Number.',
          'Check the status column.',
          'If manual verification is needed (e.g., Cash on Delivery), update the status after receiving funds (ensure Order is updated first).'
        ]
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: Image,
    description: 'Tools to promote your products and store.',
    subsections: [
      {
        id: 'deals',
        title: 'Deals',
        content: 'Create special offers like "Flash Sales" or "Black Friday" deals with countdown timers.'
      },
      {
        id: 'banners',
        title: 'Banners',
        content: 'Manage homepage banners/sliders to highlight promotions or new arrivals.'
      },
      {
        id: 'sidebar-ads',
        title: 'Sidebar Ads',
        content: 'Configure advertisements that appear in the sidebar of the shop page.'
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'System alerts and messages.',
    features: [
      'Receive alerts for new orders.',
      'Low stock warnings.',
      'System updates or errors.'
    ]
  },
  {
    id: 'settings',
    title: 'Main Settings',
    icon: Settings,
    description: 'Configure global store settings.',
    features: [
      'General Settings: Store name, contact info.',
      'Payment Methods: Enable/disable payment gateways.',
      'Shipping & Delivery: Set delivery zones and fees.',
      'Tax Rates: Configure VAT and other taxes.'
    ]
  }
];

export default function ManualPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState(manualSections[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter content based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return manualSections;
    
    const lowerQuery = searchQuery.toLowerCase();
    return manualSections.filter(section => {
      const matchTitle = section.title.toLowerCase().includes(lowerQuery);
      const matchDesc = section.description.toLowerCase().includes(lowerQuery);
      const matchFeatures = section.features?.some(f => f.toLowerCase().includes(lowerQuery));
      const matchSub = section.subsections?.some(s => 
        s.title.toLowerCase().includes(lowerQuery) || s.content.toLowerCase().includes(lowerQuery)
      );
      
      return matchTitle || matchDesc || matchFeatures || matchSub;
    });
  }, [searchQuery]);

  const handleSelectSection = (section: any) => {
    setSelectedSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-[#00afef]" size={32} />
            System Manual
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive guide to managing your ecommerce platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-[#00afef] transition duration-150 ease-in-out shadow-sm"
            placeholder="Ask a question or search for features (e.g., 'How to add product', 'Order status')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                Topics
              </div>
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredSections.length > 0 ? (
                  filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedSection.id === section.id
                          ? 'bg-blue-50 text-[#00afef] border-l-4 border-[#00afef]'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <section.icon size={18} />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No topics found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700"
            >
              <Menu size={20} />
              <span>Select Topic</span>
            </button>
          </div>

          {/* Mobile Sidebar (Drawer) */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900">Topics</h2>
                  <button onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSelectSection(section)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 ${
                        selectedSection.id === section.id ? 'bg-blue-50 text-[#00afef]' : 'text-gray-600'
                      }`}
                    >
                      <section.icon size={18} />
                      <span>{section.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1">
            {selectedSection ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                      <selectedSection.icon size={32} className="text-[#00afef]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {selectedSection.title}
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {selectedSection.description}
                  </p>
                </div>

                {/* Section Content */}
                <div className="p-6 md:p-8 space-y-8">
                  
                  {/* Features List */}
                  {selectedSection.features && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                        Key Features
                      </h3>
                      <div className="grid gap-3">
                        {selectedSection.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-[#00afef]" />
                            <p className="text-gray-700">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subsections */}
                  {selectedSection.subsections && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {selectedSection.subsections.map((sub) => (
                        <div key={sub.id} className="p-5 bg-white rounded-xl border border-gray-200 hover:border-[#00afef]/30 hover:shadow-md transition-all">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{sub.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* How-To Guides */}
                  {selectedSection.howTo && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="text-green-500" size={20} />
                        How-To Guides
                      </h3>
                      <div className="space-y-6">
                        {selectedSection.howTo.map((guide, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">{guide.title}</h4>
                            <div className="space-y-4">
                              {guide.steps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex gap-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 font-bold text-[#00afef] shadow-sm">
                                    {stepIdx + 1}
                                  </div>
                                  <p className="text-gray-700 pt-1">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Topic Selected</h3>
                <p className="text-gray-500">
                  Please select a topic from the menu or use the search bar to find help.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

