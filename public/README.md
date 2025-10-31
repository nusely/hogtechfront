# 📁 VENTECH Public Assets Directory

This folder contains all static assets accessible from the root URL (`/`).

## Directory Structure

```
public/
├── logo/              ← Brand logos and icons
├── banners/           ← Homepage hero/marketing banners
├── categories/        ← Category thumbnail images
├── placeholders/      ← Fallback/placeholder images
└── icons/             ← App icons (PWA, favicon)
```

---

## 📂 Directory Usage

### `logo/`
**Purpose**: Store brand logos and variations
**Files**:
- `ventech-logo.png` - Main logo (512x512px)
- `ventech-logo-white.png` - Logo for dark backgrounds
- `ventech-icon.png` - Favicon/app icon (192x192px)

**Usage**:
```tsx
<Image src="/logo/ventech-logo.png" alt="VENTECH" width={150} height={50} />
```

---

### `banners/`
**Purpose**: Homepage hero sliders and marketing banners
**Recommended Size**: 
- Desktop: 1920x600px
- Mobile: 800x1000px

**Files**:
- `hero-1.jpg`
- `hero-2.jpg`
- `hero-3.jpg`
- `promo-summer-sale.jpg`

**Usage**:
```tsx
<Image src="/banners/hero-1.jpg" alt="Summer Sale" fill />
```

---

### `categories/`
**Purpose**: Category thumbnail images for navigation
**Recommended Size**: 800x800px (square, 1:1 ratio)

**Files**:
- `smartphones.jpg`
- `laptops.jpg`
- `tablets.jpg`
- `accessories.jpg`
- `smartwatches.jpg`

**Usage**:
```tsx
<Image src="/categories/smartphones.jpg" alt="Smartphones" width={400} height={400} />
```

---

### `placeholders/`
**Purpose**: Fallback images when actual images aren't available
**Recommended Sizes**:
- `placeholder-product.webp` - 400x400px
- `placeholder-category.webp` - 800x800px
- `placeholder-avatar.webp` - 200x200px

**Usage**:
```tsx
<Image 
  src={product.image || '/placeholders/placeholder-product.webp'} 
  alt={product.name}
  fill
/>
```

---

### `icons/`
**Purpose**: App icons for PWA, favicon, and browser
**Files**:
- `icon-192.png` - PWA icon (192x192px)
- `icon-512.png` - PWA icon (512x512px)
- `favicon.ico` - Browser favicon (32x32px)
- `apple-touch-icon.png` - iOS icon (180x180px)

**Usage**: Automatically referenced in `layout.tsx` metadata

---

## 🎨 Image Guidelines

### Format Recommendations
- **Logos**: PNG with transparency
- **Photos**: WebP or JPEG
- **Icons**: PNG or SVG

### Optimization
Always optimize images before uploading:
- Use [TinyPNG](https://tinypng.com/) for compression
- Use [Squoosh](https://squoosh.app/) for WebP conversion
- Target file sizes:
  - Products: < 500KB
  - Banners: < 1MB
  - Icons: < 100KB

### Naming Convention
- Use lowercase
- Use hyphens for spaces
- Be descriptive
```
✅ Good: summer-sale-banner-2024.jpg
❌ Bad: IMG_1234.jpg
```

---

## 📝 Notes

### Dynamic Images
For user-generated content (product images, user avatars), use **Supabase Storage** instead:
```
Supabase Storage Buckets:
├── products/      ← Product images
├── avatars/       ← User profile pictures
└── promotions/    ← Marketing content
```

### Next.js Image Component
Always use Next.js `<Image>` component for automatic optimization:
```tsx
import Image from 'next/image';

<Image 
  src="/banners/hero-1.jpg"
  alt="Description"
  width={1920}
  height={600}
  priority // For above-the-fold images
/>
```

---

## 🚀 Quick Start

### Add a New Category Image
1. Optimize image (800x800px, < 300KB)
2. Save to `public/categories/your-category.jpg`
3. Use in code: `/categories/your-category.jpg`

### Add a New Banner
1. Create desktop version (1920x600px)
2. Create mobile version (800x1000px) - optional
3. Save to `public/banners/`
4. Add to banner CMS or hero slider

### Update Logo
1. Export logo as PNG with transparency
2. Save multiple versions in `public/logo/`
3. Update references in `NavBar.tsx` and `layout.tsx`

---

## 📚 Related Documentation

- [IMAGES_GUIDE.md](../../IMAGES_GUIDE.md) - Complete image management guide
- [Supabase Storage Guide](../../SUPABASE_SCHEMA.md) - Dynamic image storage
- [Next.js Image Docs](https://nextjs.org/docs/app/api-reference/components/image)

---

**Last Updated**: October 2025
**Project**: VENTECH E-commerce Platform



