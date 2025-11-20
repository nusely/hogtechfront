# Media Library Image Loading Fix

## Problem
Images in the Media Library are failing to load, showing errors like:
```
Image failed to load: https://files.hogtechgh.com/products/1763216147742-acer_gaming3.jpg
```

But customer-facing images work fine.

## Root Causes

### 1. CORS Configuration (Most Likely)
The Media Library uses `<img crossOrigin="anonymous">` which requires proper CORS headers.

**Fix:**
1. Go to **Cloudflare Dashboard** → **R2** → **Your Bucket** → **Settings** → **CORS Policy**
2. Update CORS to include `OPTIONS` method:
```json
[
  {
    "AllowedOrigins": [
      "https://www.hogtechgh.com",
      "https://hogtechgh.com",
      "https://hogtechfront.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD",
      "OPTIONS"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type",
      "Access-Control-Allow-Origin"
    ],
    "MaxAgeSeconds": 3600
  }
]
```
3. Click **Save**
4. Wait 2-5 minutes for changes to propagate

### 2. Custom Domain Not Fully Activated
Check if `files.hogtechgh.com` is **Active** (not just "Access: Enabled").

**Fix:**
1. Go to **R2** → **Your Bucket** → **Settings** → **Custom Domains**
2. Verify `files.hogtechgh.com` shows **Status: Active** (green)
3. If it shows **Deactivated** (red), click the ellipsis (⋮) → **Activate**

### 3. Images Don't Exist at Those Paths
The backend might be generating URLs for files that don't exist in R2.

**Verify:**
1. Try accessing an image directly in browser:
   ```
   https://files.hogtechgh.com/products/1763216147742-acer_gaming3.jpg
   ```
2. If you get 404 or 403, the file doesn't exist or isn't accessible
3. Check R2 bucket contents:
   - Go to **R2** → **Your Bucket** → **Files**
   - Verify files exist at the paths shown in Media Library

### 4. Browser Cache
Clear browser cache and hard refresh.

**Fix:**
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache in DevTools

## Quick Test

1. **Open Browser Console** (F12)
2. **Network Tab** → Filter by "Img"
3. **Try loading Media Library**
4. **Check failed requests:**
   - If you see CORS errors → Fix CORS (Step 1)
   - If you see 403 Forbidden → Activate custom domain (Step 2)
   - If you see 404 Not Found → Files don't exist (Step 3)

## Expected Behavior After Fix

- ✅ Images load in Media Library grid view
- ✅ Images load in Media Library list view
- ✅ No console errors for image loading
- ✅ Images display thumbnails correctly

## Still Not Working?

1. **Check browser console** for specific error messages
2. **Verify custom domain** is active in R2 settings
3. **Test direct image URL** in a new tab
4. **Check CORS policy** is saved correctly
5. **Wait 5-10 minutes** after making changes (propagation delay)

