# 🚀 Complete Deployment Guide - Philippine CRM

## 📋 **Pre-Deployment Checklist**

### **Environment Requirements**
```bash
# Node.js version
node --version  # Should be 18.17.0 or higher
npm --version   # Should be 9.0.0 or higher

# Required tools
git --version
docker --version  # Optional but recommended
```

### **Required Accounts & Services**
- ✅ **Supabase Account** - Database and authentication
- ✅ **Vercel Account** - Frontend deployment (recommended)
- ✅ **GitHub Repository** - Source code management
- ✅ **Domain Name** (Optional) - Custom domain for production
- ✅ **PayMongo Account** - Philippine payment processing
- ✅ **Google Cloud Account** - Maps API and other services
- ✅ **Resend Account** - Email notifications

---

## 🗄️ **Database Setup (Supabase)**

### **1. Create Supabase Project**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
mkdir philippine-crm
cd philippine-crm
supabase init
```

### **2. Configure Supabase Project**
```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations in sequence
supabase db reset

# Or apply step by step
supabase migration new create_initial_schema
supabase migration new setup_rls_policies
supabase migration new create_functions
supabase migration new philippines_crm_enhancements
supabase migration new enhanced_rls_policies
supabase migration new philippines_business_functions
supabase migration new lead_scoring_automation
supabase migration new enhanced_seed_data
supabase migration new day6_team_management
supabase migration new mobile_optimization

# Push to production
supabase db push
```

### **3. Database Migration Files**

Create these migration files in order:

**001_create_initial_schema.sql**
```sql
-- Core CRM tables
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_type TEXT,
  industry TEXT,
  tin TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  preferred_name TEXT,
  middle_name TEXT,
  job_title TEXT,
  phone TEXT,
  mobile TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  territories TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continue with all other core tables...
-- [Include all table definitions from previous days]
```

**002_setup_rls_policies.sql**
```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- [Continue with all RLS policies from previous implementations]
```

### **4. Edge Functions Deployment**
```bash
# Deploy payment processing functions
supabase functions deploy create-payment-intent
supabase functions deploy paymongo-webhook
supabase functions deploy send-notification
supabase functions deploy process-voice-note

# Set environment variables for functions
supabase secrets set PAYMONGO_SECRET_KEY=your_paymongo_secret
supabase secrets set PAYMONGO_PUBLIC_KEY=your_paymongo_public
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set OPENAI_API_KEY=your_openai_key
```

---

## 🌐 **Frontend Deployment (Vercel)**

### **1. Project Setup**
```bash
# Clone or create your Next.js project
npx create-next-app@latest philippine-crm --typescript --tailwind --eslint --app

# Install dependencies
cd philippine-crm
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts lucide-react date-fns
npm install jspdf jspdf-autotable xlsx papaparse
npm install react-swipeable react-use-measure
npm install @types/node @types/react @types/react-dom

# Development dependencies
npm install -D @types/jspdf @types/papaparse
```

### **2. Environment Configuration**
Create `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Philippine CRM"
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Payment Processing
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_your_paymongo_public_key
PAYMONGO_SECRET_KEY=sk_test_your_paymongo_secret_key

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
PHILIPPINE_BUSINESS_API_KEY=your_ph_business_api_key

# Email Service
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@your-domain.com

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_NOTES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_MOBILE_APP=true
```

### **3. Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Continue for all environment variables
```

### **4. Vercel Configuration**
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/dashboard",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/paymongo",
      "destination": "https://your-project.supabase.co/functions/v1/paymongo-webhook"
    }
  ]
}
```

---

## 📱 **PWA Configuration**

### **1. Service Worker Setup**
```typescript
// public/sw.js
const CACHE_NAME = 'philippine-crm-v1.0.0'
// [Include the complete service worker code from Day 7]
```

### **2. PWA Manifest**
```json
// public/manifest.json
{
  "name": "Philippine CRM - Business Management System",
  "short_name": "Philippine CRM",
  // [Include complete manifest from Day 7]
}
```

### **3. Next.js PWA Configuration**
```bash
# Install PWA dependencies
npm install next-pwa workbox-webpack-plugin

# Configure in next.config.js
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/your-project\.supabase\.co\/rest\/v1\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
})

module.exports = withPWA({
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
})
```

---

## 🔐 **Security & Authentication Setup**

### **1. Supabase Auth Configuration**
In Supabase Dashboard → Authentication → Settings:

```
Site URL: https://your-domain.com
Redirect URLs: 
- https://your-domain.com/auth/callback
- https://your-domain.com/auth/confirm
- http://localhost:3000/auth/callback (for development)

Email Templates: Customize with Philippine branding
```

### **2. Row Level Security Policies**
```sql
-- Ensure all RLS policies are properly set
-- [Include all RLS policies from previous implementations]
```

### **3. API Security**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Admin only routes
  if (req.nextUrl.pathname.startsWith('/admin') && session?.user?.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/protected/:path*']
}
```

---

## 💳 **Payment Integration Setup**

### **1. PayMongo Configuration**
```bash
# Test environment
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_SECRET_KEY=sk_test_...

# Production environment  
PAYMONGO_PUBLIC_KEY=pk_live_...
PAYMONGO_SECRET_KEY=sk_live_...
```

### **2. Webhook Endpoints**
Set up in PayMongo Dashboard:
```
Webhook URL: https://your-domain.com/api/webhooks/paymongo
Events: 
- payment.paid
- payment.failed
- source.chargeable
```

### **3. Payment Processing Function**
```typescript
// supabase/functions/paymongo-webhook/index.ts
// [Include webhook handler from previous implementation]
```

---

## 📊 **Analytics & Monitoring Setup**

### **1. Google Analytics 4**
```typescript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
```

### **2. Error Monitoring (Sentry)**
```bash
npm install @sentry/nextjs

# Configure sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
})
```

---

## 🚀 **Production Deployment Steps**

### **Step 1: Final Testing**
```bash
# Run all tests
npm run test

# Check build
npm run build
npm run start

# Test PWA functionality
# - Offline mode
# - Push notifications
# - Install prompt

# Test payment processing
# Test voice notes
# Test mobile responsiveness
```

### **Step 2: Domain & SSL Setup**
```bash
# Add custom domain in Vercel
vercel domains add your-domain.com

# Configure DNS records
# A record: @ → 76.76.19.61
# CNAME: www → your-project.vercel.app
```

### **Step 3: Performance Optimization**
```typescript
// next.config.js optimizations
module.exports = {
  compress: true,
  generateEtags: false,
  poweredByHeader: false,
  
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

### **Step 4: Monitoring Setup**
```bash
# Set up monitoring alerts
# - Database performance
# - API response times
# - Error rates
# - User engagement

# Supabase monitoring dashboard
# Vercel analytics
# Custom monitoring with Uptime Robot
```

---

## 📱 **Mobile App Distribution**

### **1. PWA Distribution**
```bash
# Add to app stores as PWA
# Google Play Store: TWA (Trusted Web Activity)
# Apple App Store: Progressive Web App submission
```

### **2. App Store Optimization**
```text
App Title: Philippine CRM - Business Management
Description: Advanced CRM system designed specifically for Filipino businesses...

Keywords: 
- Philippine CRM
- Filipino business
- Sales management
- Customer relationship
- Supabase CRM
- Business automation

Screenshots:
- Dashboard view (mobile & desktop)
- Contact management
- Deal pipeline
- Analytics dashboard
- Team collaboration
```

---

## 🔄 **Backup & Recovery**

### **1. Database Backups**
```bash
# Automated Supabase backups
# Daily backups are automatic on paid plans

# Manual backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db reset
psql -h your-host -U postgres -d postgres -f backup-20241201.sql
```

### **2. File Storage Backups**
```bash
# Backup Supabase storage
# Use scheduled functions or external backup service
```

---

## ⚡ **Performance Optimization**

### **1. Database Optimization**
```sql
-- Add database indexes for Philippine CRM
CREATE INDEX CONCURRENTLY idx_deals_organization_stage ON deals(organization_id, stage);
CREATE INDEX CONCURRENTLY idx_contacts_organization_city ON contacts(organization_id, city);
CREATE INDEX CONCURRENTLY idx_activities_date_org ON activities(organization_id, activity_date DESC);
CREATE INDEX CONCURRENTLY idx_deals_lead_score ON deals(lead_score DESC) WHERE lead_score IS NOT NULL;

-- Analyze query performance
ANALYZE;
```

### **2. CDN & Caching**
```bash
# Vercel Edge Network is automatic
# Additional CDN for assets if needed
# Redis caching for API responses (optional)
```

### **3. Image Optimization**
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

export default function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  )
}
```

---

## 📊 **Go-Live Checklist**

### **Pre-Launch (1 week before)**
- ✅ All features tested in staging
- ✅ Database migrations applied
- ✅ Payment processing tested
- ✅ Email notifications working
- ✅ Mobile PWA tested
- ✅ Performance optimization complete
- ✅ Security audit passed
- ✅ Backup procedures tested

### **Launch Day**
- ✅ Deploy to production
- ✅ DNS propagation complete
- ✅ SSL certificate active
- ✅ Monitoring alerts active
- ✅ Payment webhooks configured
- ✅ Analytics tracking verified
- ✅ Team training completed

### **Post-Launch (first week)**
- ✅ Monitor error rates
- ✅ Track user engagement
- ✅ Payment processing verification
- ✅ Performance monitoring
- ✅ User feedback collection
- ✅ Bug fixes and optimizations

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- Page load time: < 2 seconds
- PWA installation rate: > 15%
- Offline functionality: 100% core features
- Payment success rate: > 98%
- Mobile responsiveness: 100% compatibility

### **Business Metrics**
- User onboarding completion: > 80%
- Daily active users: Track growth
- Feature adoption: Monitor usage
- Customer satisfaction: > 4.5/5
- Philippine market penetration: Track regional usage

---

## 🆘 **Support & Maintenance**

### **Monitoring Dashboard**
```typescript
// Create admin monitoring dashboard
// - Real-time user counts
// - Error tracking
// - Payment status
// - Database performance
// - API response times
```

### **Regular Maintenance**
```bash
# Weekly tasks
# - Check error logs
# - Review performance metrics
# - Update dependencies
# - Backup verification

# Monthly tasks
# - Security updates
# - Feature usage analysis
# - User feedback review
# - Database optimization
```

## 🎉 **You're Ready to Launch!**

Your Philippine CRM is now ready for production deployment with:

✅ **Enterprise-grade architecture** - Scalable and secure  
✅ **Philippine market optimization** - Cultural intelligence built-in  
✅ **Mobile-first PWA** - Works offline for field teams  
✅ **Advanced integrations** - PayMongo, voice notes, team collaboration  
✅ **Comprehensive analytics** - Business intelligence for growth  
✅ **Professional deployment** - Production-ready with monitoring  

**🇵🇭 Launch your Philippine CRM and revolutionize Filipino business relationships!**