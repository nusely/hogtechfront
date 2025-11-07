let cachedApiBaseUrl: string | null = null;

const normalizeBase = (url: string) => url.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    cachedApiBaseUrl = normalizeBase(envUrl.trim());
    return cachedApiBaseUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { protocol, hostname, port } = window.location;

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

  cachedApiBaseUrl = 'http://localhost:5000';
  return cachedApiBaseUrl;
};

export const buildApiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  if (!path.startsWith('/')) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
};

