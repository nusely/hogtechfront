'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';

const SETTINGS_ENDPOINT = '/api/settings?keys=announcement_bar_message,maintenance_mode';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const BLINK_INTERVAL_MS = 15 * 1000; // 15 seconds
const BLINK_DURATION_MS = 1000; // Blink for 1 second

export function AnnouncementBar() {
  const [message, setMessage] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousMessageRef = useRef<string>('');
  const [isBlinking, setIsBlinking] = useState(false);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(buildApiUrl(SETTINGS_ENDPOINT), {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to load announcement settings (${response.status})`);
      }

      const payload = await response.json();
      const data = payload?.data ?? {};

      const rawMessage = (data.announcement_bar_message ?? '').trim();
      const maintenance = String(data.maintenance_mode ?? 'false').toLowerCase() === 'true';

      setMessage(rawMessage);
      setMaintenanceMode(maintenance);

      // If the message changed, reset dismissal so new announcements show up
      if (rawMessage !== previousMessageRef.current) {
        previousMessageRef.current = rawMessage;
        setDismissed(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch announcement settings:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
    const intervalId = window.setInterval(fetchAnnouncement, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;
    const intervalId = window.setInterval(() => {
      setIsBlinking(true);
      timeoutId = window.setTimeout(() => setIsBlinking(false), BLINK_DURATION_MS);
    }, BLINK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (isLoading) {
    return null;
  }

  if (maintenanceMode || dismissed || !message) {
    return null;
  }

  return (
    <div className="bg-[#00afef] text-white">
      <div className="relative container mx-auto px-3 sm:px-4 py-2 flex items-center justify-center text-center">
        <span
          className={`text-xs sm:text-sm font-medium tracking-wide leading-tight ${
            isBlinking ? 'animate-pulse' : ''
          }`}
        >
          {message}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 focus-visible:ring-offset-[#00afef]"
          aria-label="Dismiss announcement"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

