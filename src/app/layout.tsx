import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Electric - Leads-Centric Sales Platform",
  description: "Enterprise-quality CRM platform with cultural intelligence and local payment integration.",
  keywords: "CRM, Philippines, sales, leads, business, cultural intelligence",
  authors: [{ name: "Electric Team" }],
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#0f766e",
  manifest: "/manifest.json",
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
    title: "Electric - Leads-Centric Sales Platform",
    description: "Enterprise-quality CRM platform with cultural intelligence and local payment integration.",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electric - Leads-Centric Sales Platform",
    description: "Enterprise-quality CRM platform with cultural intelligence and local payment integration.",
  },
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
