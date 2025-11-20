'use client';

import { useEffect, useState } from 'react';
import { Settings, Wrench } from 'lucide-react';
import { settingsService } from '@/lib/settings.service';
import Link from 'next/link';

export default function MaintenancePage() {
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are currently performing scheduled maintenance. Please check back soon!');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceMessage = async () => {
      try {
        const message = await settingsService.getSetting('maintenance_message');
        if (message) {
          setMaintenanceMessage(message);
        }
      } catch (error) {
        console.error('Error fetching maintenance message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceMessage();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00afef] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white border-2 border-[#00afef] rounded-full p-8 shadow-lg">
              <Wrench size={64} className="text-[#00afef]" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
          We&apos;ll Be Back Soon!
        </h1>

        <p className="text-xl text-[#3A3A3A] mb-8 leading-relaxed">
          {loading ? 'Loading...' : maintenanceMessage}
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="text-[#00afef]" size={24} />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">System Maintenance</h2>
          </div>
          <p className="text-sm text-[#3A3A3A] mb-4">
            Our team is working hard to improve your experience. We apologize for any inconvenience.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#3A3A3A]">
            <div>
              <strong className="text-[#1A1A1A]">Expected Duration:</strong> Varies
            </div>
            <div>
              <strong className="text-[#1A1A1A]">Status:</strong> In Progress
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[#3A3A3A]">
            If you need immediate assistance, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:hedgehog.technologies1@gmail.com"
              className="px-6 py-3 bg-[#00afef] hover:bg-[#0099d6] text-white rounded-lg font-medium transition-colors shadow"
            >
              Email Support
            </Link>
            <Link
              href="tel:+2335538865804"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] rounded-lg font-medium transition-colors shadow"
            >
              Call Us
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-[#3A3A3A]">
            &copy; {new Date().getFullYear()} Hedgehog Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

