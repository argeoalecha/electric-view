import { NextResponse } from 'next/server'

export async function GET() {
  const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://www.lecha.co/sitemap.xml

# Block specific paths
Disallow: /auth/callback
Disallow: /api/
Disallow: /setup
Disallow: /_next/
Disallow: /admin/

# Allow important pages for SEO
Allow: /
Allow: /auth
Allow: /demo

# Crawl delay (optional - be respectful)
Crawl-delay: 1

# Host directive (helps search engines)
Host: https://www.lecha.co`

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}