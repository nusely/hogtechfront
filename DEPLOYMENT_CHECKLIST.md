# 🚀 Vercel Deployment Checklist

## Quick Setup Steps

### 1. Get Your Vercel URL
After deploying, you'll get: `https://your-project-name.vercel.app`

---

## 2. Supabase Configuration

### A. Site URL
**Location:** Supabase Dashboard → Authentication → URL Configuration

Set to:
```
https://your-project-name.vercel.app
```

### B. Redirect URLs
**Location:** Same page, add these URLs one by one:

**Production:**
```
https://your-project-name.vercel.app/auth/callback
https://your-project-name.vercel.app/reset-password
https://your-project-name.vercel.app/verify-email
```

**Development (optional):**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
http://localhost:3000/verify-email
```

**Custom Domain (if you have one):**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/reset-password
https://yourdomain.com/verify-email
```

---

## 3. Vercel Environment Variables

**Location:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for **Production** environment:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API (Required)
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Paystack (If using payments)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

### How to Get Values:

**Supabase Credentials:**
1. Go to Supabase Dashboard → Your Project
2. Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend API URL:**
- Your Render/Railway backend URL
- Example: `https://hogtech-backend.onrender.com`

---

## 4. Enable Supabase Auth Features

**Location:** Supabase Dashboard → Authentication → Settings

Enable:
- ✅ Email Signup
- ✅ Email Confirmations (recommended)
- ✅ Password Recovery

---

## 5. Redeploy

After adding environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"

Or push a new commit to trigger auto-deploy.

---

## ✅ Verification Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] Sign up works
- [ ] Email verification link works
- [ ] Login works
- [ ] Password reset works
- [ ] Admin panel accessible
- [ ] API calls work (check browser console)

---

## 🔍 Common Issues

### "Invalid redirect URL"
- Check URLs match exactly in Supabase
- No trailing slashes
- Include `https://`

### "Code exchange failed"
- Verify Site URL is set
- Check redirect URLs include `/auth/callback`
- Redeploy after env vars

### Environment variables not working
- Must start with `NEXT_PUBLIC_`
- Redeploy after adding
- Check Vercel build logs

---

## 📝 Example Values

Replace these with your actual values:

```
Site URL: https://hogtech-frontend.vercel.app

Redirect URLs:
✅ https://hogtech-frontend.vercel.app/auth/callback
✅ https://hogtech-frontend.vercel.app/reset-password
✅ https://hogtech-frontend.vercel.app/verify-email

Vercel Env Vars:
NEXT_PUBLIC_SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
```

---

## 🎯 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase URL Config:** Authentication → URL Configuration
- **Supabase Auth Settings:** Authentication → Settings

