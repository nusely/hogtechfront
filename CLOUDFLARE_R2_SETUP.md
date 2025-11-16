# 🔧 Cloudflare R2 Bucket Setup Guide

## Problem: 403 Forbidden and CORS Errors

Your R2 bucket needs to be configured for public access and CORS.

---

## Step 1: Enable Public Access for R2 Bucket

### In Cloudflare Dashboard:

1. Go to **Cloudflare Dashboard** → **R2** → **Object Storage**
2. Click on your bucket: **`hogtech-storage`**
3. Click **Settings** tab
4. Scroll down to **"Public Access"** section
5. Click **"Allow Access"** or **"Enable Public Access"**
6. Confirm the action

**Important**: This makes your bucket publicly readable. Files will be accessible via URLs.

---

## Step 2: Configure CORS Policy

### In Cloudflare Dashboard:

1. Still in your bucket (`hogtech-storage`) → **Settings** tab
2. Scroll to **"CORS Policy"** section
3. Click **"Edit CORS Policy"** or **"Add CORS Policy"**
4. Add this CORS configuration:

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

5. Click **"Save"** or **"Update"**

---

## Step 3: Verify Custom Domain Configuration

### In Cloudflare Dashboard:

1. Go to **R2** → **Settings** → **Custom Domains**
2. Ensure `files.hogtechgh.com` is listed and **Active**
3. If not listed:
   - Click **"Connect Domain"**
   - Enter: `files.hogtechgh.com`
   - Follow DNS setup instructions
   - Wait for DNS propagation (can take a few minutes)

---

## Step 4: Verify DNS Records

### In Cloudflare Dashboard:

1. Go to **DNS** → **Records**
2. Look for a record for `files.hogtechgh.com`
3. It should be a **CNAME** record pointing to your R2 bucket's public endpoint
4. If missing, Cloudflare should have provided instructions when connecting the domain

---

## Step 5: Test Image Access

After enabling public access and configuring CORS:

1. Try accessing an image directly:
   ```
   https://files.hogtechgh.com/products/1763216147742-acer_gaming3.jpg
   ```

2. **Expected Result**: Image should load in browser
3. **If still 403**: Wait a few minutes for changes to propagate, then try again

---

## Step 6: Verify in Browser

1. Open your Media Library page
2. Open Browser Console (F12)
3. Hard refresh (Ctrl+Shift+R)
4. Images should now load without 403 or CORS errors

---

## Troubleshooting

### Still Getting 403?

1. **Wait 2-5 minutes** - Changes can take time to propagate
2. **Verify Public Access is enabled** - Check bucket settings again
3. **Check file permissions** - Individual files might have restrictions
4. **Try a different image URL** - Some files might not exist

### Still Getting CORS Errors?

1. **Verify CORS policy is saved** - Check bucket settings
2. **Check allowed origins** - Ensure `https://www.hogtechgh.com` is included
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
4. **Check custom domain** - Ensure `files.hogtechgh.com` is properly connected

### Custom Domain Not Working?

1. **Check DNS records** - Verify CNAME record exists
2. **Wait for DNS propagation** - Can take up to 24 hours (usually minutes)
3. **Verify domain in R2** - Check R2 Settings → Custom Domains
4. **Check SSL certificate** - Cloudflare should auto-provision SSL

---

## Quick Checklist

- [ ] R2 bucket has **Public Access** enabled
- [ ] CORS policy is configured with your domains
- [ ] Custom domain `files.hogtechgh.com` is connected
- [ ] DNS CNAME record exists for custom domain
- [ ] Test image URL loads directly in browser
- [ ] Hard refresh browser after changes

---

## Alternative: Use R2.dev Public Domain

If custom domain setup is complex, you can temporarily use R2.dev:

1. In backend `.env`, change:
   ```
   R2_PUBLIC_URL=https://7e77e380f012a463aeb594714f5287a5.r2.dev
   ```

2. Update CORS to allow R2.dev origin
3. Note: URLs will be longer but will work immediately

---

## After Setup

Once public access and CORS are configured:
- ✅ Images will load in Media Library
- ✅ Images will display on product pages
- ✅ No more 403 or CORS errors
- ✅ All images accessible via `https://files.hogtechgh.com/...`

