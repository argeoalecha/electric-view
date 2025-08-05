# Social Authentication Setup for Philippine CRM

## Google Authentication Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Client ID:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Philippine CRM"
   - Authorized redirect URIs:
     ```
     https://tbgmweiszhsnsaarswvf.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for development)
     ```
5. Copy Client ID and Client Secret

### 2. Supabase Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: tbgmweiszhsnsaarswvf
3. Go to "Authentication" > "Providers"
4. Enable Google provider:
   - Toggle Google to "Enabled"
   - Enter Client ID from Google Console
   - Enter Client Secret from Google Console
   - Save configuration

## Facebook Authentication Setup

### 1. Facebook Developer Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing app
3. Add Facebook Login product:
   - Go to "Products" > "Facebook Login"
   - Click "Set Up"
4. Configure OAuth settings:
   - Valid OAuth Redirect URIs:
     ```
     https://tbgmweiszhsnsaarswvf.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for development)
     ```
5. Copy App ID and App Secret

### 2. Supabase Configuration
1. In Supabase Dashboard > "Authentication" > "Providers"
2. Enable Facebook provider:
   - Toggle Facebook to "Enabled"
   - Enter App ID from Facebook
   - Enter App Secret from Facebook
   - Save configuration

## Environment Variables to Add

Add these to your .env.local and Vercel:

```bash
# Social Auth Configuration
NEXT_PUBLIC_SUPABASE_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_SUPABASE_AUTH_FACEBOOK_ENABLED=true

# Optional: Custom redirect URLs
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/dashboard
```

## Current Supabase Project Details
- **Project URL**: https://tbgmweiszhsnsaarswvf.supabase.co
- **Callback URL**: https://tbgmweiszhsnsaarswvf.supabase.co/auth/v1/callback
- **Project ID**: tbgmweiszhsnsaarswvf

## Testing URLs
- **Development**: http://localhost:3000
- **Production**: https://phildeals-d465glv4i-argeos-projects-c910fac2.vercel.app
- **Custom Domain**: (to be configured)

---
*Configuration guide for Philippine CRM social authentication*