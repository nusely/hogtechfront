import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/Provider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import { seoConfig } from "@/lib/seo.config";
import { DataSync } from "@/components/DataSync";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { initSentry } from "@/lib/sentry";

// Initialize Sentry (only in browser)
if (typeof window !== 'undefined') {
  initSentry();
  
  // Register service worker for PWA (mobile only)
  if ('serviceWorker' in navigator) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768);
    
    if (isMobile) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: seoConfig.pages.homepage.title,
    template: `%s | ${seoConfig.business.fullName}`,
  },
  description: seoConfig.pages.homepage.description,
  keywords: [...seoConfig.keywords.primary, ...seoConfig.keywords.secondary],
  authors: [{ name: seoConfig.business.fullName }],
  creator: seoConfig.business.fullName,
  publisher: seoConfig.business.fullName,
  metadataBase: new URL(seoConfig.website.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: seoConfig.website.url,
    siteName: seoConfig.business.fullName,
    title: seoConfig.pages.homepage.title,
    description: seoConfig.pages.homepage.description,
    images: [
      {
        url: seoConfig.website.defaultImage,
        width: 1200,
        height: 630,
        alt: seoConfig.business.fullName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.pages.homepage.title,
    description: seoConfig.pages.homepage.description,
    images: [seoConfig.website.defaultImage],
    creator: seoConfig.website.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/favicons/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/favicons/android-chrome-512x512.png' },
    ],
  },
  manifest: '/favicons/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Hedgehog Tech" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hedgehog Tech" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#00afef" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9K7PDYW4YL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9K7PDYW4YL');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`} suppressHydrationWarning>
        <ReduxProvider>
          <DataSync />
          <div className="min-h-screen flex flex-col">
            <LayoutWrapper>{children}</LayoutWrapper>
          </div>
          <PWAInstallPrompt />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
