# Domain Setup Guide - lecha.co

## 📋 Domain Configuration for lecha.co

### Current Status
- **New Domain**: lecha.co (registered via GoDaddy)
- **Environment Variables**: Updated with domain configuration
- **Next.js Config**: Configured with domain-specific settings

### 🔧 Required Configuration Steps

#### 1. GoDaddy DNS Configuration
Configure your GoDaddy DNS settings to point to your deployment platform:

**For Vercel Deployment:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

**For Netlify Deployment:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app

Type: ALIAS/ANAME
Name: @
Value: apex-loadbalancer.netlify.com
```

#### 2. Deployment Platform Configuration

**Vercel:**
1. Go to your Vercel dashboard
2. Select your Philippine CRM project
3. Navigate to Settings → Domains
4. Add "lecha.co" and "www.lecha.co"
5. Verify domain ownership

**Netlify:**
1. Go to your Netlify dashboard
2. Select your Philippine CRM site
3. Navigate to Site settings → Domain management
4. Add custom domain: "lecha.co"
5. Configure DNS settings as shown above

#### 3. SSL Certificate
- SSL certificates will be automatically provisioned by Vercel/Netlify
- Ensure both www.lecha.co and lecha.co are covered

#### 4. Supabase Configuration
Update your Supabase project settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add the following URLs to allowed origins:
   ```
   https://lecha.co
   https://www.lecha.co
   http://localhost:3000 (for development)
   ```

3. Update redirect URLs:
   ```
   https://lecha.co/auth/callback
   https://www.lecha.co/auth/callback
   http://localhost:3000/auth/callback (for development)
   ```

#### 5. Environment Variables Update
The following environment variables have been added to your `.env.local`:

```bash
# Domain Configuration
NEXT_PUBLIC_DOMAIN=lecha.co
NEXT_PUBLIC_APP_URL=https://lecha.co
```

**For Production Deployment:**
Make sure to add these environment variables to your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

### 🚀 Deployment Steps

1. **Build and Test Locally:**
   ```bash
   npm run build
   npm run start
   ```

2. **Deploy to Production:**
   ```bash
   # For Vercel
   vercel --prod

   # For Netlify
   netlify deploy --prod
   ```

3. **Verify Domain Configuration:**
   - Check that https://lecha.co redirects properly
   - Verify SSL certificate is active
   - Test authentication flow on the new domain

### 🔍 DNS Propagation Check
Use these tools to verify DNS propagation:
- https://dnschecker.org/
- https://whatsmydns.net/

DNS propagation can take 24-48 hours to complete globally.

### 📧 Email Configuration (Optional)
If you plan to use email with lecha.co domain:

**GoDaddy Email Setup:**
1. Go to GoDaddy → My Products → Email
2. Set up professional email accounts
3. Configure MX records as provided by GoDaddy

**Third-party Email (Gmail, Outlook):**
1. Set up Google Workspace or Microsoft 365
2. Update MX records in GoDaddy DNS management
3. Verify domain ownership with email provider

### 🛡️ Security Considerations

1. **HTTPS Redirect**: Ensure all HTTP traffic redirects to HTTPS
2. **WWW Redirect**: Configure www.lecha.co → lecha.co redirect
3. **Security Headers**: Already configured in Next.js config
4. **Domain Verification**: Complete domain verification on all platforms

### 🔄 Rollback Plan
If issues occur, you can quickly rollback by:
1. Updating DNS records back to previous configuration
2. Reverting environment variables
3. Redeploying with original settings

### 📞 Support Resources
- **GoDaddy Support**: For DNS and domain issues
- **Vercel/Netlify Support**: For deployment platform issues
- **Supabase Support**: For authentication configuration issues

## ✅ Verification Checklist

- [ ] DNS records updated in GoDaddy
- [ ] Domain added to deployment platform
- [ ] SSL certificate active
- [ ] Supabase URLs updated
- [ ] Environment variables configured
- [ ] Production deployment successful
- [ ] Authentication flow tested
- [ ] Email configuration (if needed)

---

**Note**: Keep this document updated as you complete each step. The domain change is a critical update that affects authentication, deployments, and user access.