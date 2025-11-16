# 🚨 CRITICAL: Vercel Environment Variables Setup

## Problem
If you're seeing CORS errors like:
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'https://hogtechgh.com' 
has been blocked by CORS policy
```

This means `NEXT_PUBLIC_API_URL` is **NOT SET** in your Vercel environment variables.

**Note:** Your production domain is `https://hogtechgh.com` (custom domain).

---

## ✅ Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **hogtechfront**
3. Go to: **Settings** → **Environment Variables**

### Step 2: Add Required Variables

Add these **3 variables** for **Production** environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

**⚠️ IMPORTANT:** 
- Replace `your-backend-name.onrender.com` with your **actual Render.com backend URL**
- Get your Render.com URL from: https://dashboard.render.com → Your Backend Service → Copy the URL

### Step 3: Also Add for Preview Environment (Optional but Recommended)

Add the same variables for **Preview** environment so preview deployments work too.

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Select **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

---

## 🔍 How to Verify

After redeploying, check the browser console on your production site:

✅ **Correct:** Should see API calls to `https://your-backend-name.onrender.com/api/...`
❌ **Wrong:** If you see `http://localhost:5000/api/...`, the env var is still not set

---

## 📝 Example Values

Replace with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
```

---

## 🆘 Still Having Issues?

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click on a deployment → View Build Logs
   - Look for any errors about missing environment variables

2. **Verify Variable Names:**
   - Must be exactly: `NEXT_PUBLIC_API_URL` (case-sensitive)
   - Must start with `NEXT_PUBLIC_` to be accessible in the browser

3. **Check Render.com Backend:**
   - Make sure your backend is deployed and running
   - Test the backend URL directly: `https://your-backend-name.onrender.com/health`
   - Should return: `{"status":"ok","message":"Hogtech API is running"}`

4. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

---

## 📚 Related Documentation

- See `VERCEL_SUPABASE_SETUP.md` for complete deployment guide
- See `DEPLOYMENT_CHECKLIST.md` for quick reference

