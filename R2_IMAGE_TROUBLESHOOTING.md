# 🔍 R2 Image Loading Troubleshooting Guide

## Problem: Images Not Showing in Media Library

If images show file names but not the actual images, follow these steps:

---

## Step 1: Check Browser Console

Open your browser's Developer Tools (F12) and check:

1. **Console Tab**: Look for errors like:
   - `Failed to load image: [URL]`
   - `CORS policy blocked`
   - `404 Not Found`
   - `403 Forbidden`

2. **Network Tab**: 
   - Find the image request
   - Check the status code (should be 200)
   - Check the response headers

---

## Step 2: Verify R2 Bucket is Publicly Accessible

### In Cloudflare Dashboard:

1. Go to **R2** → Your Bucket (`hogtech-storage`)
2. Click **Settings** → **Public Access**
3. Ensure **"Public Access"** is **ENABLED**
4. If using a custom domain (`files.hogtechgh.com`):
   - Go to **R2** → **Settings** → **Public Access**
   - Ensure your custom domain is configured
   - Check that the domain is verified

### Test Image URL Directly:

Try accessing an image URL directly in your browser:
```
https://files.hogtechgh.com/products/[your-image-name].webp
```

**Expected Result**: Image should load directly
**If it fails**: R2 bucket is not publicly accessible

---

## Step 3: Check CORS Configuration

### In Cloudflare Dashboard:

1. Go to **R2** → Your Bucket → **Settings** → **CORS Policy**
2. Add or verify this CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "https://www.hogtechgh.com",
      "https://hogtechgh.com",
      "https://hogtechfront.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Step 4: Verify Backend Environment Variables

Check your backend `.env` file (or Render.com environment variables):

```bash
R2_PUBLIC_URL=https://files.hogtechgh.com
R2_BUCKET_NAME=hogtech-storage
R2_ACCOUNT_ID=7e77e380f012a463aeb594714f5287a5
```

**Important**: 
- `R2_PUBLIC_URL` should be your custom domain (`https://files.hogtechgh.com`)
- NOT the `.r2.cloudflarestorage.com` endpoint (that's API-only)

---

## Step 5: Check Image URLs in Console

After deploying the latest changes, check your browser console:

1. Open Media Library page
2. Look for console logs:
   ```
   Media files fetched: [number]
   Sample file URLs: [{ key: "...", url: "..." }]
   ```

3. Copy one of the URLs and test it directly in a new browser tab

**If URL works in browser but not in media library**: 
- CORS issue
- Browser cache issue (try hard refresh: Ctrl+Shift+R)

**If URL doesn't work in browser**:
- R2 bucket not public
- URL format incorrect
- Image doesn't exist at that path

---

## Step 6: Verify URL Format

The backend should generate URLs in this format:

**Custom Domain:**
```
https://files.hogtechgh.com/products/1763216572101-image.webp
```

**NOT:**
```
https://files.hogtechgh.com/hogtech-storage/products/1763216572101-image.webp
```

The bucket name should NOT be in the URL path for custom domains.

---

## Step 7: Test Backend API Directly

Test the list endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://hogtech-backend.onrender.com/api/upload/list?maxKeys=5
```

Check the returned URLs - they should be accessible.

---

## Step 8: Check R2 File Permissions

In Cloudflare Dashboard:

1. Go to **R2** → Your Bucket
2. Click on a file
3. Check **"Public Access"** - should be enabled
4. If not, you may need to enable public access for the entire bucket

---

## Quick Fixes:

### Fix 1: Enable Public Access
- Cloudflare Dashboard → R2 → Bucket → Settings → Public Access → **Enable**

### Fix 2: Configure Custom Domain
- Cloudflare Dashboard → R2 → Settings → Custom Domains
- Add `files.hogtechgh.com` if not already added
- Verify DNS records are correct

### Fix 3: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Fix 4: Check Backend Logs
- Check Render.com logs for errors when listing files
- Look for R2 access errors or permission issues

---

## Common Issues:

### Issue: Images show as broken/empty
**Cause**: R2 bucket not publicly accessible
**Fix**: Enable public access in Cloudflare Dashboard

### Issue: CORS errors in console
**Cause**: CORS not configured for your frontend domain
**Fix**: Add your domain to R2 CORS policy

### Issue: 404 errors
**Cause**: URL format incorrect or file doesn't exist
**Fix**: Check backend URL generation logic

### Issue: 403 Forbidden
**Cause**: R2 bucket permissions issue
**Fix**: Ensure bucket has public read access enabled

---

## Still Not Working?

1. **Check browser console** for specific error messages
2. **Test image URL directly** in browser
3. **Verify R2 bucket settings** in Cloudflare Dashboard
4. **Check backend logs** on Render.com
5. **Verify environment variables** are set correctly

---

## Debugging Commands:

### Test if R2 bucket is accessible:
```bash
curl -I https://files.hogtechgh.com/products/[any-image-name].webp
```

Should return `200 OK` if bucket is public.

### Check backend URL generation:
Look at backend logs when listing files - URLs should be logged.

