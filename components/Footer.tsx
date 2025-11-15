'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/lib/settings.service';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const storeSettings = await settingsService.getSettingsByCategory('store');
        if (isMounted) {
          setSettings(storeSettings);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching settings for footer:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const storeName = settings.store_name || 'Hedgehog Technologies';
  const storeTagline = settings.store_tagline || 'Your trusted tech partner in Ghana';
  const storePhone = settings.store_phone || '+233 55 134 4310';
  const storeEmail = settings.store_email || 'hedgehog.technologies1@gmail.com';
  // For migration: check new key first, then fallback to old keys
  const address = settings.store_address || 
                  (settings.store_address_ho && settings.store_address_accra 
                    ? `${settings.store_address_ho}, ${settings.store_address_accra}`
                    : settings.store_address_ho || settings.store_address_accra || '');
  const facebookUrl = settings.store_facebook_url || '';
  const twitterUrl = settings.store_twitter_url || '';
  const instagramUrl = settings.store_instagram_url || '';
  const linkedinUrl = settings.store_linkedin_url || '';
  const whatsappNumber = settings.store_whatsapp_number || '';

  const socialLinks = [
    {
      url: facebookUrl,
      label: 'Facebook',
      Icon: Facebook,
    },
    {
      url: twitterUrl,
      label: 'Twitter',
      Icon: Twitter,
    },
    {
      url: instagramUrl,
      label: 'Instagram',
      Icon: Instagram,
    },
    {
      url: linkedinUrl,
      label: 'LinkedIn',
      Icon: Linkedin,
    },
    {
      url: whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` : '',
      label: 'WhatsApp',
      Icon: MessageCircle,
    },
  ];

  if (loading) {
    return null; // Don't show footer while loading
  }

  return (
    <footer className="bg-[#1A1A1A] text-white py-6 sm:py-8 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6">
          {/* Store Info */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-white !text-white">{storeName}</h3>
            <p className="text-sm text-white mb-4 !text-white">{storeTagline}</p>
            <div className="space-y-2 text-sm text-gray-400">
              {storePhone && (
                <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="block hover:text-[#00afef] transition-colors">
                  {storePhone}
                </a>
              )}
              {storeEmail && (
                <a href={`mailto:${storeEmail}`} className="block hover:text-[#00afef] transition-colors">
                  {storeEmail}
                </a>
              )}
              {address && (
                <p className="mt-2">{address}</p>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/categories" className="hover:text-[#00afef] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-[#00afef] transition-colors">
                  Deals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#00afef] transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-[#00afef] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#00afef] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#00afef] transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li>
                <Link href="/privacy" className="hover:text-[#00afef] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00afef] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#00afef] transition-colors">
                  Returns
                </Link>
              </li>
            </ul>

            {/* Social Media Links */}
            {(facebookUrl || twitterUrl || instagramUrl || linkedinUrl || whatsappNumber) && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks
                    .filter(({ url }) => !!url)
                    .map(({ url, label, Icon }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full border border-white/20 hover:border-[#00afef] hover:text-[#00afef] transition-colors"
                        aria-label={label}
                      >
                        <Icon size={18} />
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved. Powered by{' '}
            <a
              href="https://cimonstechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00afef] underline underline-offset-2"
            >
              Cimons
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

