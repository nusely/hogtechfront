# 🔧 Cloudflare R2 Bucket Setup Guide

## Problem: 403 Forbidden and CORS Errors

Your R2 bucket needs to be configured for public access and CORS.

---

## Step 1: Transfer Domain to Same Cloudflare Account (RECOMMENDED)

**⚠️ IMPORTANT**: The domain `hogtechgh.com` must be in the **SAME Cloudflare account** as your R2 bucket for the custom domain to work easily.

### Option A: Transfer Domain Between Cloudflare Accounts

If `hogtechgh.com` is currently in a different Cloudflare account:

#### In the OLD Account (where domain currently is):

1. Go to **Cloudflare Dashboard** → **All Websites**
2. Click on **`hogtechgh.com`**
3. Go to **Overview** tab
4. Scroll down to find **"Transfer out of Cloudflare"** or **"Remove Site"**
5. **IMPORTANT**: Before removing, **export your DNS records**:
   - Go to **DNS** → **Records**
   - Note down all existing DNS records (or take screenshots)
   - You'll need to recreate these in the new account
6. Click **"Remove Site"** or **"Transfer out"**
   - This will remove the domain from Cloudflare DNS
   - **Your domain registrar nameservers will revert to default**
   - **Your website may go offline temporarily** until you re-add it

#### In the NEW Account (where R2 is):

1. Go to **Cloudflare Dashboard** → **All Websites**
2. Click **"Add a Site"** or **"Add Site"**
3. Enter: **`hogtechgh.com`**
4. Select a plan (Free plan works fine)
5. Cloudflare will scan for existing DNS records
6. **Recreate your DNS records** from the old account:
   - Go to **DNS** → **Records**
   - Add back all the records you noted earlier (A, AAAA, CNAME, MX, TXT, etc.)
   - **Important**: Make sure to add records for `www.hogtechgh.com` and any other subdomains
7. **Update nameservers** at your domain registrar:
   - Cloudflare will show you new nameservers (e.g., `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
   - Go to your domain registrar (where you bought `hogtechgh.com`)
   - Update nameservers to Cloudflare's nameservers
   - Wait for DNS propagation (5-30 minutes)
8. Once Cloudflare verifies the domain, it will be **Active**

### Option B: Add Domain to Cloudflare (If Not Already Added)

If `hogtechgh.com` is not in Cloudflare at all:

1. Go to **Cloudflare Dashboard** → **All Websites**
2. Click **"Add a Site"** or **"Add Site"**
3. Enter: **`hogtechgh.com`**
4. Select a plan (Free plan works fine)
5. Cloudflare will scan your existing DNS records
6. **Update your domain's nameservers** at your domain registrar to point to Cloudflare:
   - Cloudflare will show you the nameservers (e.g., `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
   - Go to your domain registrar (where you bought `hogtechgh.com`)
   - Update nameservers to Cloudflare's nameservers
   - Wait for DNS propagation (5-30 minutes)
7. Once Cloudflare verifies the domain, it will be **Active**

### Verify Domain is Active:

- Domain status should show **"Active"** (green checkmark)
- You should see DNS records listed
- Zone ID should be visible (e.g., `58113c0d296b671321b776d411ef9e06`)

---

## Step 2: Add Custom Domain to R2 Bucket

**After transferring the domain to the same account (Step 1), this should work smoothly:**

1. Go to **Cloudflare Dashboard** → **R2** → **Object Storage**
2. Click on your bucket: **`hogtech-storage`**
3. Click **Settings** tab
4. Scroll to **"Custom Domains"** section
5. Click **"+ Add"** button
6. Enter: **`files.hogtechgh.com`**
7. Cloudflare should automatically detect the zone (since `hogtechgh.com` is now in the same account)
8. You'll see a **"Preview DNS Record"** dialog showing:
   - Type: **CNAME**
   - Name: **`files`**
   - Bucket: **`hogtech-storage`**
9. Click **"Connect domain"** button
10. Cloudflare will automatically:
    - Create the CNAME DNS record for `files.hogtechgh.com`
    - Provision an SSL certificate
    - Activate the domain
11. Wait for activation (may take 2-5 minutes)

**Important**: The domain must be **Activated** (Status: "Active", not "Deactivated") for images to load!

### If You Still Get Zone Error:

- Make sure the domain is fully active in the same account (green checkmark)
- Wait a few minutes after transferring and try again
- Check that DNS records are properly configured

---

## Step 1b: Enable Public Access for R2 Bucket

### In Cloudflare Dashboard:

1. Still in your bucket → **Settings** tab
2. Scroll down to **"Public Access"** section
3. Click **"Allow Access"** or **"Enable Public Access"**
4. Confirm the action

**Note**: If you see "Public Development URL" enabled, that's good - it means public access is working.

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

**Important Notes:**
- Make sure `https://www.hogtechgh.com` is included (with `www`)
- Cloudflare R2 handles `OPTIONS` (CORS preflight) automatically - don't include it in AllowedMethods
- Only include `GET` and `HEAD` methods (R2 doesn't support `OPTIONS` in CORS policy)

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

### "Zone ID is Not Valid" Error?

This error typically means:

1. **Domain not in the same Cloudflare account**: The domain must be in the same account as your R2 bucket
2. **Domain not fully active**: Wait a few minutes after adding/transferring the domain
3. **DNS not propagated**: Wait for DNS changes to propagate (5-30 minutes)

### Solution: Transfer Domain to Same Account

**The easiest solution is to transfer the domain to the same Cloudflare account as your R2 bucket:**

1. Remove domain from old account (after exporting DNS records)
2. Add domain to new account (where R2 is)
3. Recreate DNS records
4. Update nameservers at registrar
5. Wait for activation
6. Then add custom domain in R2

**Alternative**: If you can't transfer right now, use the Public Development URL temporarily (see "Alternative" section below).

---

## Quick Checklist

- [ ] R2 bucket has **Public Access** enabled
- [ ] CORS policy is configured with your domains
- [ ] Custom domain `files.hogtechgh.com` is connected
- [ ] DNS CNAME record exists for custom domain
- [ ] Test image URL loads directly in browser
- [ ] Hard refresh browser after changes

---

## Alternative: Use Public Development URL (Quick Fix)

If activating the custom domain takes time, you can temporarily use the Public Development URL:

1. **In Cloudflare Dashboard:**
   - Your bucket shows: `https://pub-f63eb5ea8fe74f69a1f749fff4872f46.r2.dev`
   - Make sure it's **enabled** (button should say "Disable", not "Enable")

2. **Update Backend Environment Variable on Render.com:**
   - Go to Render.com → Your Backend Service → **Environment**
   - Find `R2_PUBLIC_URL`
   - Change from: `https://files.hogtechgh.com`
   - Change to: `https://pub-f63eb5ea8fe74f69a1f749fff4872f46.r2.dev`
   - Save and redeploy

3. **Update CORS Policy** to include:
   ```json
   "AllowedOrigins": [
     "https://pub-f63eb5ea8fe74f69a1f749fff4872f46.r2.dev",
     "https://www.hogtechgh.com",
     "https://hogtechgh.com"
   ]
   ```

4. **Note**: This is a temporary solution. Once `files.hogtechgh.com` is activated, switch back to using it.

---

## After Setup

Once public access and CORS are configured:
- ✅ Images will load in Media Library
- ✅ Images will display on product pages
- ✅ No more 403 or CORS errors
- ✅ All images accessible via `https://files.hogtechgh.com/...`

