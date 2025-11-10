'use client';

import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/lib/api';

let cachedValue: boolean | null = null;
let lastFetched = 0;
let pendingRequest: Promise<boolean> | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const requestAllowBackorders = async (): Promise<boolean> => {
  const now = Date.now();

  if (cachedValue !== null && now - lastFetched < CACHE_TTL) {
    return cachedValue;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = fetch(buildApiUrl('/api/settings?keys=automation_allow_backorders'))
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch automation settings');
      }

      const payload = await response.json();
      const rawValue = payload?.data?.automation_allow_backorders ?? payload?.data?.AUTOMATION_ALLOW_BACKORDERS;
      const resolved = String(rawValue ?? '').toLowerCase() === 'true';

      cachedValue = resolved;
      lastFetched = Date.now();
      return resolved;
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to default backorder setting (false):', error);
      }
      cachedValue = false;
      lastFetched = Date.now();
      return false;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const getAllowBackorders = async (): Promise<boolean> => {
  return requestAllowBackorders();
};

export const useAllowBackorders = () => {
  const [allowBackorders, setAllowBackorders] = useState<boolean>(cachedValue ?? false);
  const [loading, setLoading] = useState<boolean>(cachedValue === null);

  useEffect(() => {
    let mounted = true;
    requestAllowBackorders()
      .then((value) => {
        if (mounted) {
          setAllowBackorders(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setAllowBackorders(false);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { allowBackorders, loading };
};
