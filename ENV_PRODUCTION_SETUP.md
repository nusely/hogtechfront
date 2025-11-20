# 🔧 Production Environment Variables Setup

## ✅ Your Backend is Already Deployed!

**Backend URL**: `https://hogtech-backend.onrender.com`

### **1. Frontend Environment Variables (Vercel)**

When deploying to **Vercel**, add this in the Vercel Dashboard:

**Settings → Environment Variables → Add:**

```env
NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
```

**OR** if you set up a custom domain `api.hogtechgh.com` (optional):

```env
NEXT_PUBLIC_API_URL=https://api.hogtechgh.com
```

**OR** create `.env.production` file locally (but don't commit it):

```env
NEXT_PUBLIC_API_URL=https://api.hogtechgh.com
NEXT_PUBLIC_ENVIRONMENT=production
```

---

### **2. Backend CORS Configuration**

In your **backend** `.env` file (when deployed to Railway/Render):

```env
CORS_ORIGIN=https://hogtechgh.com,https://www.hogtechgh.com
```

This allows your frontend domain to call the API.

---

### **3. Where It's Used in Code**

The frontend uses `NEXT_PUBLIC_API_URL` in:

- ✅ `services/product.service.ts`
- ✅ `services/order.service.ts`
- ✅ `services/cart.service.ts`
- ✅ `services/discount.service.ts`
- ✅ `services/coupon.service.ts`
- ✅ All API service files

**Example:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/products`);
```

---

## 📋 **Complete Production Environment Variables**

### **Frontend (Vercel Dashboard):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_ENVIRONMENT=production
```

### **Backend (Railway/Render Dashboard):**

```env
PORT=5000
SUPABASE_URL=https://hrmxchfwiozifgpmjemf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_long_random_secret
RESEND_API_KEY=re_your_key
CORS_ORIGIN=https://hogtechgh.com,https://www.hogtechgh.com
NODE_ENV=production
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🚀 **Deployment Flow**

1. **✅ Backend Already Deployed** → `https://hogtech-backend.onrender.com`
2. **Deploy Frontend** → Set `NEXT_PUBLIC_API_URL=https://hogtech-backend.onrender.com` in Vercel
3. **Test** → Frontend calls `https://hogtech-backend.onrender.com/api/products` ✅

**Optional**: If you want a custom domain `api.hogtechgh.com`:
- In Render dashboard → Settings → Custom Domain → Add `api.hogtechgh.com`
- Add CNAME record in your DNS: `api` → `hogtech-backend.onrender.com`
- Then use `NEXT_PUBLIC_API_URL=https://api.hogtechgh.com` in Vercel

---

## ⚠️ **Important Notes**

- **Local Development**: Keep `http://localhost:5000` in `.env`
- **Production**: Use `https://hogtech-backend.onrender.com` in Vercel environment variables
- **Never commit** `.env` or `.env.production` files to git
- Always set environment variables in your hosting platform (Vercel)

---

## 🎯 **Quick Setup for Vercel**

**Just add this ONE environment variable in Vercel:**

```
NEXT_PUBLIC_API_URL = https://hogtech-backend.onrender.com
```

That's it! Your frontend will now call your existing backend! ✅

