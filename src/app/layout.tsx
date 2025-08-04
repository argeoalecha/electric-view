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
  title: "Philippine CRM - Leads-Centric Sales Platform",
  description: "Enterprise-quality CRM designed specifically for Philippine businesses with cultural intelligence and local payment integration.",
  keywords: "CRM, Philippines, sales, leads, business, cultural intelligence",
  authors: [{ name: "Philippine CRM Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" className={inter.variable}>
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
