'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  ChevronLeft,
  Store,
  Mail,
  Globe,
  CreditCard,
  Truck,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  category: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('email');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/');
    }
    fetchSettings();
  }, [isAuthenticated, user, router]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      setSettings(data || []);
      
      // Initialize form data
      const initialData: Record<string, string> = {};
      data?.forEach((setting) => {
        initialData[setting.key] = setting.value || '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update each changed setting
      const updates = Object.entries(formData).map(([key, value]) => {
        return supabase
          .from('settings')
          .update({ value, updated_by: user?.id })
          .eq('key', key);
      });

      await Promise.all(updates);
      
      toast.success('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'email', label: 'Email Settings', icon: Mail, color: 'text-blue-600' },
    { id: 'store', label: 'Store Info', icon: Store, color: 'text-orange-600' },
    { id: 'payment', label: 'Payment', icon: CreditCard, color: 'text-green-600' },
    { id: 'shipping', label: 'Shipping', icon: Truck, color: 'text-purple-600' },
    { id: 'general', label: 'General', icon: Globe, color: 'text-indigo-600' },
  ];

  const getSettingsByCategory = (category: string) => {
    return settings.filter((s) => s.category === category);
  };

  const renderField = (setting: Setting) => {
    const isBoolean = setting.value === 'true' || setting.value === 'false';
    
    if (isBoolean) {
      return (
        <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-[#1A1A1A]">
              {setting.description || setting.key}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormData({ ...formData, [setting.key]: 'false' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData[setting.key] === 'false'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              Disabled
            </button>
            <button
              onClick={() => setFormData({ ...formData, [setting.key]: 'true' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData[setting.key] === 'true'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              Enabled
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={setting.key} className="space-y-2">
        <label className="text-sm font-medium text-[#1A1A1A]">
          {setting.description || setting.key}
        </label>
        <input
          type="text"
          value={formData[setting.key] || ''}
          onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A19]"
          placeholder={`Enter ${setting.description?.toLowerCase() || setting.key}`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft size={20} />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Settings</h1>
                <p className="text-sm text-[#3A3A3A] mt-1">Configure your VENTECH store</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save size={16} />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Email Not Configured Warning */}
        {formData['email_sender_address'] === 'ventechgadgets@gmail.com' && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Email Configuration Required
              </h3>
              <p className="text-sm text-[#3A3A3A]">
                Please configure your email settings in the <strong>Email Settings</strong> tab to enable automatic
                email notifications for orders, wishlist reminders, and cart abandonment.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[#FF7A19] text-[#FF7A19] bg-orange-50'
                      : 'text-[#3A3A3A] hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={activeTab === tab.id ? tab.color : ''} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19]"></div>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl">
                {getSettingsByCategory(activeTab).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#3A3A3A]">No settings available for this category.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {getSettingsByCategory(activeTab).map((setting) => renderField(setting))}
                    </div>
                    
                    {/* Category-specific help text */}
                    {activeTab === 'email' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                          📧 Email Configuration Help
                        </h4>
                        <p className="text-sm text-[#3A3A3A] leading-relaxed">
                          The email sender address will be used for all automated emails including order confirmations,
                          shipping updates, wishlist reminders, and cart abandonment emails. Make sure this email
                          is configured in your backend SMTP settings.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'store' && (
                      <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                          🏪 Store Information
                        </h4>
                        <p className="text-sm text-[#3A3A3A] leading-relaxed">
                          This information will be displayed on your website footer, contact page, and in customer
                          emails. Keep it accurate and up-to-date.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
