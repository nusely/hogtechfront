# 🖼️ VENTECH - Image Inventory

## Current Images Available

### ✅ Logo Files (`/logo/`)
```
✓ ventech_logo_1.png      - Main VENTECH logo
✓ ventech_icon.png         - Icon/favicon version
```

**Usage in code:**
```tsx
// In components
<Image src="/logo/ventech_logo_1.png" alt="VENTECH" width={40} height={40} />
```

---

### ✅ Icons (`/icons/`)
```
✓ favicon.png              - Browser favicon (copied from ventech_icon.png)
✓ icon-192.png             - PWA icon 192x192 (copied from ventech_icon.png)
✓ icon-512.png             - PWA icon 512x512 (copied from ventech_icon.png)
```

**Auto-configured in `layout.tsx`:**
```tsx
icons: {
  icon: '/icons/favicon.png',
  apple: '/icons/icon-192.png',
}
```

---

### ✅ Placeholders (`/placeholders/`)
```
✓ imageplaceholder.webp         - Original placeholder
✓ placeholder-product.webp      - For products (copy of imageplaceholder.webp)
✓ placeholder-category.webp     - For categories (copy of imageplaceholder.webp)
✓ placeholder-avatar.webp       - For user avatars (copy of imageplaceholder.webp)
```

**Usage in code:**
```tsx
// Automatic fallback in components
<Image 
  src={product.thumbnail || '/placeholders/placeholder-product.webp'} 
  alt={product.name}
  fill
/>
```

---

### ✅ Category Images (`/categories/`)
```
✓ accessories.webp
✓ laptops.webp
✓ smartphones.webp
✓ smartwatches.webp
✓ tablets.webp
```

**Usage in code:**
```tsx
// In category data
const categories = [
  {
    id: '1',
    name: 'Smartphones',
    slug: 'smartphones',
    thumbnail: '/categories/smartphones.webp',
  },
  // ... more categories
];
```

---

### ⏳ Needed: Hero Banners (`/banners/`)
```
⏳ hero-1.jpg/webp            - Main hero banner (1920x600px)
⏳ hero-2.jpg/webp            - Secondary banner (1920x600px)
⏳ hero-3.jpg/webp            - Third banner (1920x600px)
⏳ promo-flash-sale.webp      - Flash deals banner
```

**Recommended sources:**
- Unsplash: https://unsplash.com/s/photos/electronics
- Pexels: https://pexels.com/search/technology/

---

## Updated Code References

### 1. NavBar Component
**Location**: `frontend/components/navigation/NavBar.tsx`
```tsx
<Image
  src="/logo/ventech_logo_1.png"
  alt="VENTECH"
  width={40}
  height={40}
  className="object-contain"
/>
```

### 2. Layout Metadata
**Location**: `frontend/app/layout.tsx`
```tsx
icons: {
  icon: '/icons/favicon.png',
  apple: '/icons/icon-192.png',
}
```

### 3. Product Cards
**Location**: `frontend/components/cards/ProductCard.tsx`
```tsx
src={product.thumbnail || '/placeholders/placeholder-product.webp'}
```

### 4. Category Cards
**Location**: `frontend/components/cards/CategoryCard.tsx`
```tsx
src={category.thumbnail || '/placeholders/placeholder-category.webp'}
```

### 5. Helper Function
**Location**: `frontend/lib/helpers.ts`
```tsx
export const getImageUrl = (path: string, bucket: string = 'products'): string => {
  if (!path) return '/placeholders/placeholder-product.webp';
  // ...
};
```

---

## Image Format Summary

| Type | Format | Count | Status |
|------|--------|-------|--------|
| Logos | PNG | 2 | ✅ Complete |
| Icons | PNG | 3 | ✅ Complete |
| Placeholders | WebP | 4 | ✅ Complete |
| Categories | WebP | 5 | ✅ Complete |
| Banners | WebP/JPG | 0 | ⏳ Needed |

---

## Quick Actions

### Add More Category Images
1. Save image to `public/categories/[category-name].webp`
2. Reference in code: `/categories/[category-name].webp`

### Add Hero Banners
1. Create/download banner (1920x600px)
2. Optimize with Squoosh: https://squoosh.app/
3. Save to `public/banners/hero-X.webp`
4. Update HeroSlider component

### Update Logo
1. Replace `public/logo/ventech_logo_1.png`
2. Logo appears automatically everywhere

---

## Directory Structure
```
frontend/public/
├── logo/
│   ├── ventech_logo_1.png ✅
│   └── ventech_icon.png ✅
├── icons/
│   ├── favicon.png ✅
│   ├── icon-192.png ✅
│   └── icon-512.png ✅
├── placeholders/
│   ├── imageplaceholder.webp ✅
│   ├── placeholder-product.webp ✅
│   ├── placeholder-category.webp ✅
│   └── placeholder-avatar.webp ✅
├── categories/
│   ├── accessories.webp ✅
│   ├── laptops.webp ✅
│   ├── smartphones.webp ✅
│   ├── smartwatches.webp ✅
│   └── tablets.webp ✅
└── banners/
    └── (empty - add hero banners here) ⏳
```

---

**Last Updated**: October 28, 2025  
**Status**: Images organized and code updated ✅



