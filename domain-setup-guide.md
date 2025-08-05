# Custom Domain Setup for Philippine CRM

## Recommended Domain Names
1. **philippinecrm.com** - Professional and descriptive
2. **philcrm.app** - Modern .app TLD, great for web apps
3. **crm.ph** - Perfect for Philippine market (if available)
4. **phildeals.co** - Short and memorable

## Domain Setup Steps

### Option 1: Buy Domain Through Vercel
```bash
# Check domain availability
vercel domains buy philippinecrm.com

# Add domain to your project
vercel domains add philippinecrm.com --project phil_deals
```

### Option 2: Use External Domain Provider
1. **Buy domain** from your preferred provider (Namecheap, GoDaddy, etc.)
2. **Add to Vercel:**
   ```bash
   vercel domains add your-domain.com --project phil_deals
   ```
3. **Configure DNS** with your domain provider:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.61`

### Option 3: Vercel Dashboard Setup
1. Go to: https://vercel.com/argeos-projects-c910fac2/phil_deals/settings/domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions

## Current Project URLs
- **Production**: https://phildeals-d465glv4i-argeos-projects-c910fac2.vercel.app
- **Latest**: https://phildeals-kqhr4ume3-argeos-projects-c910fac2.vercel.app

## Benefits of Custom Domain
- Professional appearance
- Better SEO
- Easier to remember
- SSL certificate included
- Better for social auth redirects

## Next Steps After Domain Setup
1. Update Supabase auth settings with new domain
2. Update social auth provider redirect URLs
3. Test all authentication flows
4. Update any hardcoded URLs in the application

---
*Generated for Philippine CRM deployment*