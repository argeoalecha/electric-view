# Supabase Setup Guide for Philippine CRM

## Step 1: Create New Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. **Project Name:** `Philippine CRM`
4. **Database Password:** Generate a strong password (save it securely)
5. **Region:** Singapore (closest to Philippines)
6. **Pricing Plan:** Free tier is sufficient for development

## Step 2: Get API Credentials

After project creation (takes ~2 minutes):

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://[your-project-ref].supabase.co`
   - **Project API Keys:**
     - `anon` `public` key (starts with `eyJ`)
     - `service_role` `secret` key (starts with `eyJ`)

## Step 3: Update Environment Variables

Replace in `.env.local`:

```bash
# Replace these with your new Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

## Step 4: Run Database Migrations

After updating credentials, run:

```bash
# I'll provide the complete migration script
npm run setup-database
```

## Migration Scripts Ready

I have prepared all the database migration scripts with:
- ✅ Philippine business schema (TIN, regions, business types)
- ✅ Cultural intelligence (relationship levels, lead scoring)
- ✅ Multi-tenant architecture with RLS
- ✅ Sample Philippine data (Ayala Land, SM, etc.)

**Please create the Supabase project and share the credentials so I can complete the database setup.**