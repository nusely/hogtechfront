/**
 * Custom image loader for Next.js Image component
 * Bypasses Next.js optimization for R2 images to avoid 502 errors
 */
export const r2ImageLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // If it's already an R2 URL (files.hogtechgh.com), return as-is (no optimization)
  if (src.startsWith('https://files.hogtechgh.com') || 
      src.startsWith('http://files.hogtechgh.com') ||
      src.includes('.r2.dev') ||
      src.includes('.r2.cloudflarestorage.com')) {
    return src;
  }
  
  // If it's a local path, use Next.js optimization
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  // For other external URLs, try Next.js optimization
  // But if it fails, the browser will handle it
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};

