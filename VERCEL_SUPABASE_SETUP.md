# 🚀 Vercel + Supabase Setup Guide

## Step 1: Your Production Domain

Your production domain is:
- **Custom Domain:** `https://hogtechgh.com` (primary)
- **Vercel URL:** `https://hogtechfront.vercel.app` (fallback)

**Note:** Use `hogtechgh.com` as your primary domain for all configurations.

--- hogtechfront.vercel.app

## Step 2: Configure Supabase Dashboard

### A. Set Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **URL Configuration**
4. Set **Site URL** to your custom domain:
   ```
   https://hogtechgh.com
   ```
   
   **Note:** This is your production domain. Development will use `http://localhost:3000` automatically.

### B. Add Redirect URLs

In the same **URL Configuration** section, add these redirect URLs **one by one**:

**⚠️ IMPORTANT: Add BOTH Production AND Development URLs**

**Production URLs (Custom Domain):**
```
https://hogtechgh.com/auth/callback
https://hogtechgh.com/reset-password
https://hogtechgh.com/verify-email
```

**Production URLs (Vercel - Optional fallback):**
```
https://hogtechfront.vercel.app/auth/callback
https://hogtechfront.vercel.app/reset-password
https://hogtechfront.vercel.app/verify-email
```

**Development URLs (Localhost - Required for local development):**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
http://localhost:3000/verify-email
```

**Custom Domain URLs (if you have a custom domain):**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/reset-password
https://yourdomain.com/verify-email
```

**Why all of them?**
- **Custom Domain URLs** → For your live production site (`hogtechgh.com`)
- **Vercel URLs** → Fallback if custom domain has issues
- **Development URLs** → For local development (`npm run dev`)

**Important:**
- Add each URL separately by clicking "Add URL"
- URLs must match exactly (including `https://` and no trailing slashes)
- If you have a custom domain, add those URLs too:
  ```
  https://yourdomain.com/auth/callback
  https://yourdomain.com/reset-password
  https://yourdomain.com/verify-email
  ```

---

## Step 3: Configure Vercel Environment Variables

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables for **Production** environment:

### Required Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (Render.com)
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com

# Paystack (if using payments)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

### How to Get Values:

**Supabase Credentials:**
1. Go to Supabase Dashboard → Your Project
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend API URL (Render.com):**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service
3. Copy the service URL (format: `https://your-service-name.onrender.com`)
4. Use this for `NEXT_PUBLIC_API_URL`

### Optional Variables (if needed):

```env
# For custom domains
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# For maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## Step 4: Enable Supabase Auth Features

In Supabase Dashboard → **Authentication** → **Settings**:

✅ **Enable Email Signup** - ON
✅ **Enable Email Confirmations** - ON (recommended)
✅ **Enable Password Recovery** - ON
✅ **Enable Email Change** - ON (optional)

---

## Step 5: Configure Email Templates (Optional)

If you want custom email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** - Email verification
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset

---

## Step 6: Redeploy After Configuration

After setting environment variables in Vercel:

1. Go to **Vercel Dashboard** → **Your Project** → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## Step 7: Test Authentication Flow

After deployment, test these flows:

### ✅ Sign Up Flow:
1. Go to `/register`
2. Sign up with email
3. Check email for verification link
4. Click verification link
5. Should redirect to `/verify-email` or login page

### ✅ Login Flow:
1. Go to `/login`
2. Login with verified email
3. Should redirect to homepage or dashboard

### ✅ Password Reset Flow:
1. Go to `/forgot-password`
2. Enter email
3. Check email for reset link
4. Click reset link
5. Should redirect to `/reset-password`
6. Set new password
7. Login with new password

---

## 🔍 Troubleshooting

### Issue: "Invalid redirect URL"

**Solution:**
- Check that redirect URLs are added in Supabase Dashboard
- URLs must match exactly (including protocol `https://`)
- No trailing slashes
- Check Vercel deployment URL matches what you added

### Issue: "Code exchange failed"

**Solution:**
- Verify Site URL is set correctly in Supabase
- Check that redirect URLs include `/auth/callback`
- Ensure environment variables are set in Vercel
- Redeploy after adding environment variables

### Issue: Emails not sending

**Solution:**
- Check Supabase Dashboard → Authentication → Settings
- Verify "Enable Email Confirmations" is ON
- Check spam folder
- Verify email templates are configured

### Issue: Environment variables not working

**Solution:**
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check Vercel build logs for errors
- Verify variable names match exactly (case-sensitive)

---

## 📋 Quick Checklist

Before going live:

- [ ] Site URL set in Supabase (production URL)
- [ ] All redirect URLs added in Supabase
- [ ] Environment variables added in Vercel
- [ ] Supabase auth features enabled
- [ ] Redeployed after configuration
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested password reset flow
- [ ] Custom domain configured (if applicable)
- [ ] Email templates customized (optional)

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Auth Settings:** Authentication → Settings
- **Supabase URL Config:** Authentication → URL Configuration

---

## 📝 Example Configuration

### Supabase URL Configuration:
```
Site URL: https://hogtechgh.com

Redirect URLs:
✅ https://hogtechgh.com/auth/callback (Production - Custom Domain)
✅ https://hogtechgh.com/reset-password (Production - Custom Domain)
✅ https://hogtechgh.com/verify-email (Production - Custom Domain)
✅ https://hogtechfront.vercel.app/auth/callback (Production - Vercel fallback)
✅ https://hogtechfront.vercel.app/reset-password (Production - Vercel fallback)
✅ https://hogtechfront.vercel.app/verify-email (Production - Vercel fallback)
✅ http://localhost:3000/auth/callback (Development)
✅ http://localhost:3000/reset-password (Development)
✅ http://localhost:3000/verify-email (Development)
```

### Vercel Environment Variables (Production):
```
NEXT_PUBLIC_SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
```

### Local Development Environment Variables (.env.local):
Create a `.env.local` file in your project root for local development:

```env
# Supabase (same as production)
NEXT_PUBLIC_SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API (local development - use local backend or Render URL)
NEXT_PUBLIC_API_URL=http://localhost:5000
# OR use Render URL for development too:
# NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
```

**Note:** `.env.local` is gitignored and won't be committed to your repository.

---

## 🎉 You're Done!

Once configured, your authentication will work seamlessly with Vercel deployment!

