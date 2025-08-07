import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Electric - Philippine Business CRM Platform",
  description: "Enterprise-quality CRM platform designed for Philippine businesses with cultural intelligence and local payment integration.",
  keywords: "CRM Philippines, sales platform, business management, lead tracking, Philippine CRM, cultural intelligence",
  authors: [{ name: "Electric Team" }],
  manifest: "/manifest.json",
  metadataBase: new URL("https://www.lecha.co"),
  alternates: {
    canonical: "https://www.lecha.co",
  },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Electric",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Electric",
    title: "Electric - Philippine Business CRM Platform",
    description: "Enterprise-quality CRM platform designed for Philippine businesses with cultural intelligence and local payment integration.",
    locale: "en_PH",
    url: "https://www.lecha.co",
    images: [
      {
        url: "https://www.lecha.co/og-image.png",
        width: 1200,
        height: 630,
        alt: "Electric - Philippine Business CRM Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electric - Philippine Business CRM Platform",
    description: "Enterprise-quality CRM platform designed for Philippine businesses with cultural intelligence and local payment integration.",
    images: ["https://www.lecha.co/og-image.png"],
    site: "@lecha_co",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <SupabaseProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
