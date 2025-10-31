'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface SidebarAd {
  id: string;
  title: string;
  image_url: string;
  link: string;
  position: 'right';
  show_on: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function SidebarAdsPage() {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<SidebarAd[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // TODO: Fetch real data from Supabase
  useEffect(() => {
    setTimeout(() => {
      setAds([
        {
          id: '1',
          title: 'iPhone 15 Pro Launch',
          image_url: '/placeholders/imageplaceholder.webp',
          link: '/product/iphone-15-pro',
          position: 'right',
          show_on: ['homepage', 'shop'],
          active: true,
          sort_order: 1,
          created_at: '2025-10-20',
        },
        {
          id: '2',
          title: 'Laptop Banking Promo',
          image_url: '/placeholders/imageplaceholder.webp',
          link: '/laptop-banking',
          position: 'right',
          show_on: ['homepage'],
          active: true,
          sort_order: 2,
          created_at: '2025-10-22',
        },
        {
          id: '3',
          title: 'Black Friday Deal',
          image_url: '/placeholders/imageplaceholder.webp',
          link: '/deals',
          position: 'right',
          show_on: ['homepage', 'shop', 'product'],
          active: false,
          sort_order: 3,
          created_at: '2025-10-15',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActive = (adId: string) => {
    setAds(
      ads.map((ad) => (ad.id === adId ? { ...ad, active: !ad.active } : ad))
    );
    toast.success('Ad status updated');
  };

  const deleteAd = (adId: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      setAds(ads.filter((ad) => ad.id !== adId));
      toast.success('Ad deleted successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading sidebar ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Sidebar Ads</h1>
          <p className="text-sm text-[#3A3A3A] mt-1">
            Manage promotional ads displayed in the right sidebar
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
        >
          Add New Ad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-[#3A3A3A] mb-1">Total Ads</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{ads.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-[#3A3A3A] mb-1">Active Ads</p>
          <p className="text-3xl font-bold text-green-600">
            {ads.filter((a) => a.active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-[#3A3A3A] mb-1">Inactive Ads</p>
          <p className="text-3xl font-bold text-gray-400">
            {ads.filter((a) => !a.active).length}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>💡 Tip:</strong> Sidebar ads are displayed in a 1:1 ratio on the right side
          of the page. They rotate automatically if multiple ads are active for the same page.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A19]"
          />
        </div>
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Show On
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A1A1A] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#3A3A3A]">
                    No sidebar ads found
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1A1A1A]">{ad.title}</p>
                      <p className="text-xs text-[#3A3A3A]">{ad.link}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {ad.show_on.map((page, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 rounded text-xs text-[#3A3A3A]"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(ad.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ad.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ad.active ? '✓ Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#3A3A3A]">{ad.sort_order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={18} className="text-[#3A3A3A]" />
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Add New Sidebar Ad</h2>
            <p className="text-sm text-[#3A3A3A] mb-6">
              Ad form coming soon. Will include image upload (R2), title, link, pages to show
              on, and sort order.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Save Ad
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



