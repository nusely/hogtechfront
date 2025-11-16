# 🔧 Fixing Vercel Image Optimization 502 Errors

## Problem
You're seeing `502 Bad Gateway` errors for Next.js image optimization:
```
GET https://www.hogtechgh.com/_next/image?url=https%3A%2F%2Ffiles.hogtechgh.com%2F... 502 (Bad Gateway)
```

This happens when Vercel's image optimization service can't fetch images from your R2 bucket (`files.hogtechgh.com`).

---

## ✅ Solution 1: Verify R2 Bucket is Publicly Accessible

1. **Check R2 Bucket Settings:**
   - Go to Cloudflare Dashboard → R2 → Your Bucket (`hogtech-storage`)
   - Ensure the bucket is **publicly accessible**
   - Check CORS settings allow requests from Vercel

2. **Test Image URL Directly:**
   - Try accessing an image directly: `https://files.hogtechgh.com/products/[image-name].webp`
   - If it doesn't load, the bucket isn't publicly accessible

---

## ✅ Solution 2: Configure Vercel Image Domains

1. **Go to Vercel Dashboard:**
   - Your Project → **Settings** → **Domains**
   - Scroll down to **Image Optimization**
   - Add `files.hogtechgh.com` to allowed domains

2. **Or use Environment Variable:**
   - Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_IMAGE_DOMAINS=files.hogtechgh.com
   ```

---

## ✅ Solution 3: Disable Image Optimization (Quick Fix)

If optimization isn't critical, you can disable it for external images:

**Update `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.hogtechgh.com',
        pathname: '/**',
      },
    ],
    // Disable optimization for external images
    unoptimized: process.env.NODE_ENV === 'production',
  },
};
```

**Or use regular `<img>` tags instead of `<Image>` for R2 images:**
```tsx
// Instead of:
<Image src="https://files.hogtechgh.com/products/image.webp" />

// Use:
<img src="https://files.hogtechgh.com/products/image.webp" alt="Product" />
```

---

## ✅ Solution 4: Use Next.js Image with loader (Recommended)

Create a custom image loader that bypasses Vercel's optimization:

**Create `lib/imageLoader.ts`:**
```typescript
export const r2ImageLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // If it's already an R2 URL, return as-is (no optimization)
  if (src.startsWith('https://files.hogtechgh.com')) {
    return src;
  }
  // Otherwise use default Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};
```

**Use in components:**
```tsx
import Image from 'next/image';
import { r2ImageLoader } from '@/lib/imageLoader';

<Image
  loader={r2ImageLoader}
  src="https://files.hogtechgh.com/products/image.webp"
  alt="Product"
  width={256}
  height={256}
/>
```

---

## 🔍 Debugging Steps

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for image optimization errors
   - Check if there are timeout or connection errors

2. **Test Image Accessibility:**
   ```bash
   curl -I https://files.hogtechgh.com/products/[your-image].webp
   ```
   - Should return `200 OK`
   - Check headers for CORS and access control

3. **Verify R2 CORS Configuration:**
   - Cloudflare Dashboard → R2 → Your Bucket → Settings → CORS
   - Should allow requests from `https://www.hogtechgh.com` and `https://hogtechgh.com`

---

## 📝 Current Configuration

Your `next.config.ts` already includes:
- ✅ `files.hogtechgh.com` in `remotePatterns`
- ✅ Pathname pattern matching
- ✅ CORS headers for image endpoint

**Next Steps:**
1. Verify R2 bucket is publicly accessible
2. Check Vercel logs for specific errors
3. Consider using Solution 4 (custom loader) if optimization isn't needed

---

## 🎯 Quick Test

After deploying, test an image URL:
```
https://www.hogtechgh.com/_next/image?url=https%3A%2F%2Ffiles.hogtechgh.com%2Fproducts%2F[your-image].webp&w=256&q=75
```

If it still returns 502, the issue is likely:
- R2 bucket not publicly accessible
- Network/firewall blocking Vercel's IPs
- Image doesn't exist at that URL

