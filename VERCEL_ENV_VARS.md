# Vercel Environment Variables

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**

## Required Variables for Production

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL - PRODUCTION (Render)
NEXT_PUBLIC_API_URL=https://ventech-backend.onrender.com

# Paystack Configuration (Using Test Keys for Now)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_test_key
```

## Important Notes

1. **NEXT_PUBLIC_API_URL** must match your Render backend URL
   - Render URL format: `https://[service-name].onrender.com`
   - Your service name: `ventech-backend`
   - Full URL: `https://ventech-backend.onrender.com`

2. **After adding variables**, you must **redeploy** for changes to take effect

3. **Different environments**:
   - **Production**: Use Render URL (`https://ventech-backend.onrender.com`)
   - **Preview**: You can use same or different backend
   - **Development**: Use localhost (`http://localhost:5000`)

## Verify Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `ventech-backend` service
3. Check the URL shown (should be `https://ventech-backend.onrender.com`)
4. Copy it exactly (including `https://` and no trailing slash)

## Paystack Test Keys

**Current Setup**: Using test keys (`pk_test_...`)

**To get your Paystack test keys**:
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Settings → API Keys & Webhooks
3. Copy your **Test Public Key** (starts with `pk_test_`)
4. Add it to Vercel environment variables as shown above

**When ready for live payments**:
- Switch to **Live Public Key** (starts with `pk_live_`)
- Update `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in Vercel
- Redeploy your frontend

