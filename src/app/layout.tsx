import type { Metadata } from "next";
import { Alegreya_Sans, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import JsonLd from "@/components/seo/json-ld";
import ScrollJump from "@/components/ui/scroll-jump";
import { siteConfig } from "@/config/site";
import "./globals.css";

const bodyFont = Alegreya_Sans({
  subsets: ["latin"],
  variable: "--font-body-family",
  weight: ["400", "500", "700"],
});

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading-family",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body className={`${bodyFont.variable} ${headingFont.variable} min-h-screen antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <ScrollJump />
        <Footer />
      </body>
    </html>
  );
}
