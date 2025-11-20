# How to Update Your R2 CORS Policy

## Current CORS Policy
```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET"
    ]
  }
]
```

## Updated CORS Policy (Copy This Entire Block)

Replace your current CORS policy with this:

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
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**Note:** Cloudflare R2 doesn't require `OPTIONS` in AllowedMethods - it handles CORS preflight automatically.

## Step-by-Step Instructions

1. **Go to Cloudflare Dashboard** → **R2** → **Object Storage**
2. Click on your bucket: **`hogtech-storage`**
3. Click **Settings** tab
4. Scroll to **"CORS Policy"** section
5. Click **"Edit CORS Policy"** or **"Add CORS Policy"**
6. **Delete** the old JSON (the one with just localhost:3000)
7. **Paste** the new JSON above
8. Click **"Save"** or **"Update"**
9. Wait 2-5 minutes for changes to propagate

## What Changed?

- ✅ Added production domains (`www.hogtechgh.com`, `hogtechgh.com`)
- ✅ Added Vercel preview URL (`hogtechfront.vercel.app`)
- ✅ Added `HEAD` and `OPTIONS` methods (required for CORS preflight)
- ✅ Added `AllowedHeaders` (allows all headers)
- ✅ Added `ExposeHeaders` (exposes CORS headers to JavaScript)
- ✅ Added `MaxAgeSeconds` (caches CORS preflight for 1 hour)

## After Updating

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Check Media Library** - images should now load
3. **Check browser console** - no more CORS errors

