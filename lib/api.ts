let cachedApiBaseUrl: string | null = null;

const normalizeBase = (url: string) => url.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  // First priority: Check environment variable (required for production)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    cachedApiBaseUrl = normalizeBase(envUrl.trim());
    return cachedApiBaseUrl;
  }

  // Second priority: Detect production vs development
  if (typeof window !== 'undefined' && window.location?.origin) {
    const { protocol, hostname, port } = window.location;
    
    // If we're on a production domain (vercel.app, custom domain, etc.), 
    // we MUST have NEXT_PUBLIC_API_URL set - throw an error instead of guessing
    const isProduction = hostname.includes('vercel.app') || 
                         hostname.includes('.onrender.com') || 
                         (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.'));
    
    if (isProduction) {
      console.error(
        '❌ NEXT_PUBLIC_API_URL is not set! ' +
        'Please set NEXT_PUBLIC_API_URL environment variable in Vercel to your Render.com backend URL. ' +
        'Example: https://your-backend-name.onrender.com'
      );
      // Still try to construct a URL, but log the error
      // In production, this should never happen if env vars are set correctly
    }

    // Only use localhost detection for development
    if (!isProduction) {
      let resolvedPort = port;
      if (port === '3000' || port === '4173' || port === '5173') {
        resolvedPort = '5000';
      }

      let base = `${protocol}//${hostname}`;
      if (resolvedPort && resolvedPort.length > 0 && resolvedPort !== '80' && resolvedPort !== '443') {
        base += `:${resolvedPort}`;
      }

      cachedApiBaseUrl = normalizeBase(base);
      return cachedApiBaseUrl;
    }
  }

  // Fallback: Only use localhost in development (SSR/build time)
  // In production builds, this should never be reached if env vars are set
  const isDevelopment = process.env.NODE_ENV === 'development';
  cachedApiBaseUrl = isDevelopment ? 'http://localhost:5000' : '';
  
  if (!cachedApiBaseUrl) {
    console.error(
      '❌ NEXT_PUBLIC_API_URL is not configured! ' +
      'Please set NEXT_PUBLIC_API_URL environment variable. ' +
      'For production: https://your-backend-name.onrender.com'
    );
  }
  
  return cachedApiBaseUrl;
};

export const buildApiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  if (!path.startsWith('/')) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
};

