'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { adminSettingsService } from '@/services/adminSettings.service';
import { settingsService as clientSettingsService } from '@/lib/settings.service';
import { DeliveryOptionsSettings } from '@/components/admin/DeliveryOptionsSettings';
import { useAppSelector } from '@/store';
import { TaxesManager } from '@/components/admin/TaxesManager';
import { DiscountsManager } from '@/components/admin/DiscountsManager';

type TabKey =
  | 'general'
  | 'inventory'
  | 'pricing'
  | 'taxes'
  | 'discounts'
  | 'payments'
  | 'shipping'
  | 'automation';

const tabs: Array<{ key: TabKey; label: string; disabled?: boolean }> = [
  { key: 'general', label: 'General Store Settings' },
  { key: 'inventory', label: 'Inventory Settings' },
  { key: 'pricing', label: 'Pricing Defaults' },
  { key: 'taxes', label: 'Tax Rules' },
  { key: 'discounts', label: 'Discount Rules' },
  { key: 'payments', label: 'Payments & Checkout', disabled: true },
  { key: 'shipping', label: 'Shipping & Delivery' },
  { key: 'automation', label: 'Automation & Smart Rules' },
];

const outOfStockOptions: Array<{ value: 'hide' | 'show' | 'backorder'; label: string }> = [
  { value: 'hide', label: 'Hide product from storefront' },
  { value: 'show', label: 'Show as out of stock (prevent checkout)' },
  { value: 'backorder', label: 'Allow purchase and mark as backorder' },
];

export default function MainSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingAutomation, setSavingAutomation] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    storePhone: '',
    storeEmail: '',
    storeWhatsapp: '',
    storeAddressHo: '',
    storeAddressAccra: '',
    storeFacebook: '',
    storeInstagram: '',
    storeTwitter: '',
    storeLinkedin: '',
    storeOpen: true,
    maintenanceMessage: '',
    announcementMessage: '',
  });

  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: 3,
    outOfStockBehavior: 'hide' as 'hide' | 'show' | 'backorder',
  });

  const [pricingSettings, setPricingSettings] = useState({
    taxRate: '',
  });

  const [automationSettings, setAutomationSettings] = useState({
    allowBackorders: false,
    allowAdminManualOrders: false,
  });

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
    loadSettings();
  }, [isAuthenticated, user, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const [store, inventory, pricing, automation] = await Promise.all([
        adminSettingsService.getSettings({ category: 'store' }),
        adminSettingsService.getSettings({ category: 'inventory' }),
        adminSettingsService.getSettings({ category: 'pricing' }),
        adminSettingsService.getSettings({ category: 'automation' }),
      ]);

      const getValue = (
        obj: Record<string, { value: string | null; description?: string | null }> | undefined,
        key: string,
      ) => obj?.[key]?.value ?? null;

      setGeneralSettings({
        storePhone: getValue(store, 'store_phone') || '',
        storeEmail: getValue(store, 'store_email') || '',
        storeWhatsapp: getValue(store, 'store_whatsapp_number') || '',
        storeAddressHo: getValue(store, 'store_address_ho') || '',
        storeAddressAccra: getValue(store, 'store_address_accra') || '',
        storeFacebook: getValue(store, 'store_facebook_url') || '',
        storeInstagram: getValue(store, 'store_instagram_url') || '',
        storeTwitter: getValue(store, 'store_twitter_url') || '',
        storeLinkedin: getValue(store, 'store_linkedin_url') || '',
        storeOpen: (getValue(store, 'maintenance_mode') || 'false') !== 'true',
        maintenanceMessage: getValue(store, 'maintenance_message') || '',
        announcementMessage: getValue(store, 'announcement_bar_message') || '',
      });

      const thresholdValue = parseInt(getValue(inventory, 'inventory_low_stock_threshold') || '', 10);
      const outOfStockBehavior = (getValue(inventory, 'inventory_out_of_stock_behavior') as
        | 'hide'
        | 'show'
        | 'backorder') || 'hide';

      setInventorySettings({
        lowStockThreshold: !Number.isNaN(thresholdValue) && thresholdValue > 0 ? thresholdValue : 3,
        outOfStockBehavior,
      });

      setPricingSettings({
        taxRate: getValue(pricing, 'pricing_tax_rate') || '',
      });

      setAutomationSettings({
        allowBackorders: (getValue(automation, 'automation_allow_backorders') || 'false') === 'true',
        allowAdminManualOrders:
          (getValue(automation, 'automation_allow_admin_manual_orders') || 'false') === 'true',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSavingGeneral(true);
      await adminSettingsService.updateSettings([
        { key: 'store_phone', value: generalSettings.storePhone, category: 'store' },
        { key: 'store_email', value: generalSettings.storeEmail, category: 'store' },
        { key: 'store_whatsapp_number', value: generalSettings.storeWhatsapp, category: 'store' },
        { key: 'store_address_ho', value: generalSettings.storeAddressHo, category: 'store' },
        { key: 'store_address_accra', value: generalSettings.storeAddressAccra, category: 'store' },
        { key: 'store_facebook_url', value: generalSettings.storeFacebook, category: 'store' },
        { key: 'store_instagram_url', value: generalSettings.storeInstagram, category: 'store' },
        { key: 'store_twitter_url', value: generalSettings.storeTwitter, category: 'store' },
        { key: 'store_linkedin_url', value: generalSettings.storeLinkedin, category: 'store' },
        { key: 'announcement_bar_message', value: generalSettings.announcementMessage, category: 'store' },
        { key: 'maintenance_message', value: generalSettings.maintenanceMessage, category: 'store' },
        { key: 'maintenance_mode', value: (!generalSettings.storeOpen).toString(), category: 'store' },
      ]);

      clientSettingsService.clearCache();
      toast.success('General settings updated successfully');
    } catch (error: any) {
      console.error('Error saving general settings:', error);
      toast.error(error.message || 'Failed to update general settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveInventorySettings = async () => {
    try {
      setSavingInventory(true);
      await adminSettingsService.updateSettings([
        {
          key: 'inventory_low_stock_threshold',
          value: inventorySettings.lowStockThreshold,
          category: 'inventory',
        },
        {
          key: 'inventory_out_of_stock_behavior',
          value: inventorySettings.outOfStockBehavior,
          category: 'inventory',
        },
      ]);

      clientSettingsService.clearCache();
      toast.success('Inventory settings updated successfully');
    } catch (error: any) {
      console.error('Error saving inventory settings:', error);
      toast.error(error.message || 'Failed to update inventory settings');
    } finally {
      setSavingInventory(false);
    }
  };

  const savePricingSettings = async () => {
    try {
      setSavingPricing(true);
      await adminSettingsService.updateSettings([
        {
          key: 'pricing_tax_rate',
          value: pricingSettings.taxRate,
          category: 'pricing',
        },
      ]);

      clientSettingsService.clearCache();
      toast.success('Pricing settings updated successfully');
    } catch (error: any) {
      console.error('Error saving pricing settings:', error);
      toast.error(error.message || 'Failed to update pricing settings');
    } finally {
      setSavingPricing(false);
    }
  };

  const saveAutomationSettings = async () => {
    try {
      setSavingAutomation(true);
      await adminSettingsService.updateSettings([
        {
          key: 'automation_allow_backorders',
          value: automationSettings.allowBackorders,
          category: 'automation',
        },
        {
          key: 'automation_allow_admin_manual_orders',
          value: automationSettings.allowAdminManualOrders,
          category: 'automation',
        },
      ]);

      clientSettingsService.clearCache();
      toast.success('Automation settings updated successfully');
    } catch (error: any) {
      console.error('Error saving automation settings:', error);
      toast.error(error.message || 'Failed to update automation settings');
    } finally {
      setSavingAutomation(false);
    }
  };

  const renderTabContent = useMemo(() => {
    if (loading) {
      return (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Store Contact Details</h2>
                <p className="text-sm text-gray-600 mt-1">Update the primary contact information displayed to customers.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Support Phone"
                  value={generalSettings.storePhone}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storePhone: e.target.value }))}
                  placeholder="e.g., +233 55 134 4310"
                />
                <Input
                  label="Customer Support Email"
                  type="email"
                  value={generalSettings.storeEmail}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeEmail: e.target.value }))}
                  placeholder="support@example.com"
                />
                <Input
                  label="WhatsApp Number"
                  value={generalSettings.storeWhatsapp}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeWhatsapp: e.target.value }))}
                  placeholder="e.g., +233 55 134 4310"
                />
                <Input
                  label="Store Address (Ho)"
                  value={generalSettings.storeAddressHo}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeAddressHo: e.target.value }))}
                  placeholder="Ho, Ghana"
                />
                <Input
                  label="Store Address (Accra)"
                  value={generalSettings.storeAddressAccra}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeAddressAccra: e.target.value }))}
                  placeholder="Accra, Ghana"
                />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Store Availability & Announcements</h2>
                <p className="text-sm text-gray-600 mt-1">Quickly enable maintenance mode or update announcement messages.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generalSettings.storeOpen}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeOpen: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-[#FF7A19] focus:ring-[#FF7A19]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Store is currently {generalSettings.storeOpen ? 'Open' : 'Closed'}
                    </p>
                    <p className="text-xs text-gray-500">Toggle off to enable maintenance mode and disable checkout.</p>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="announcement_message">
                    Announcement Bar Message
                  </label>
                  <textarea
                    id="announcement_message"
                    value={generalSettings.announcementMessage}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, announcementMessage: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#FF7A19] focus:ring-2 focus:ring-[#FF7A19]"
                    placeholder="e.g., Free shipping on orders above GHS 500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">Displayed at the top of the site for promotions and urgent notices.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="maintenance_message">
                    Maintenance Mode Message
                  </label>
                  <textarea
                    id="maintenance_message"
                    value={generalSettings.maintenanceMessage}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, maintenanceMessage: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#FF7A19] focus:ring-2 focus:ring-[#FF7A19]"
                    placeholder="We are performing scheduled maintenance. Please check back soon."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">This appears on the maintenance page when the store is closed.</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
                <p className="text-sm text-gray-600 mt-1">Control the links displayed in the footer across the site.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Facebook URL"
                  value={generalSettings.storeFacebook}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeFacebook: e.target.value }))}
                  placeholder="https://facebook.com/yourpage"
                />
                <Input
                  label="Instagram URL"
                  value={generalSettings.storeInstagram}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeInstagram: e.target.value }))}
                  placeholder="https://instagram.com/yourpage"
                />
                <Input
                  label="Twitter URL"
                  value={generalSettings.storeTwitter}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeTwitter: e.target.value }))}
                  placeholder="https://x.com/yourpage"
                />
                <Input
                  label="LinkedIn URL"
                  value={generalSettings.storeLinkedin}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, storeLinkedin: e.target.value }))}
                  placeholder="https://linkedin.com/company/yourpage"
                />
              </div>
            </section>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={saveGeneralSettings}
                disabled={savingGeneral}
              >
                {savingGeneral ? 'Saving...' : 'Save General Settings'}
              </Button>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                <p className="text-sm text-gray-600 mt-1">Configure how the dashboard and notifications handle low inventory.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Low Stock Threshold"
                  type="number"
                  min={1}
                  value={inventorySettings.lowStockThreshold.toString()}
                  onChange={(e) =>
                    setInventorySettings((prev) => ({
                      ...prev,
                      lowStockThreshold: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                  placeholder="3"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="out_of_stock_behavior">
                    Out-of-stock Behaviour
                  </label>
                  <select
                    id="out_of_stock_behavior"
                    value={inventorySettings.outOfStockBehavior}
                    onChange={(e) =>
                      setInventorySettings((prev) => ({
                        ...prev,
                        outOfStockBehavior: e.target.value as 'hide' | 'show' | 'backorder',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#FF7A19] focus:ring-2 focus:ring-[#FF7A19]"
                  >
                    {outOfStockOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Choose how out-of-stock products should appear to shoppers and the admin team.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Low stock alerts feed the dashboard insights, admin notifications, and email alerts.
              </p>
            </section>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={saveInventorySettings}
                disabled={savingInventory}
              >
                {savingInventory ? 'Saving...' : 'Save Inventory Settings'}
              </Button>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Global Tax Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">Set your default VAT or tax rate for orders.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  min={0}
                  step={0.1}
                  value={pricingSettings.taxRate}
                  onChange={(e) => setPricingSettings({ taxRate: e.target.value })}
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500">
                This rate is used in order calculations and reporting. Set to 0 if you do not charge tax.
              </p>
            </section>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={savePricingSettings}
                disabled={savingPricing}
              >
                {savingPricing ? 'Saving...' : 'Save Pricing Settings'}
              </Button>
            </div>
          </div>
        );
      case 'taxes':
        return <TaxesManager />;
      case 'discounts':
        return <DiscountsManager />;
      case 'payments':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Payments & Checkout</h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Configuration for supported payment gateways (Paystack, Mobile Money, etc.) will live here. We&apos;ll unlock this section once the integration checklist is complete.
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Coming Soon</p>
          </div>
        );
      case 'shipping':
        return <DeliveryOptionsSettings />;
      case 'automation':
        return (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Automation & Smart Rules</h2>
                <p className="text-sm text-gray-600 mt-1">Fine-tune how the system automates order handling.</p>
              </div>
              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={automationSettings.allowBackorders}
                    onChange={(e) =>
                      setAutomationSettings((prev) => ({ ...prev, allowBackorders: e.target.checked }))
                    }
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-[#FF7A19] focus:ring-[#FF7A19]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Allow Backorders</p>
                    <p className="text-xs text-gray-500">
                      Customers can place orders for items that are out of stock. Their orders are held until you restock.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={automationSettings.allowAdminManualOrders}
                    onChange={(e) =>
                      setAutomationSettings((prev) => ({
                        ...prev,
                        allowAdminManualOrders: e.target.checked,
                      }))
                    }
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-[#FF7A19] focus:ring-[#FF7A19]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Allow Admin-created Orders (No Payment Required)</p>
                    <p className="text-xs text-gray-500">
                      Admins can create orders on behalf of customers without taking payment upfront. Customers receive the usual order confirmation email.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={saveAutomationSettings}
                disabled={savingAutomation}
              >
                {savingAutomation ? 'Saving...' : 'Save Automation Settings'}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    generalSettings,
    inventorySettings,
    pricingSettings,
    automationSettings,
    loading,
    savingGeneral,
    savingInventory,
    savingPricing,
    savingAutomation,
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                if (!tab.disabled) {
                  setActiveTab(tab.key);
                }
              }}
              disabled={tab.disabled}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#FF7A19] text-white shadow-sm'
                  : tab.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#FF7A19]'
              }`}
            >
              {tab.label}
              {tab.disabled && <span className="ml-2 text-xs uppercase tracking-wide">Soon</span>}
            </button>
          );
        })}
      </div>

      {renderTabContent}
    </div>
  );
}
