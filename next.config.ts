import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Note: instrumentationHook is now available by default in Next.js 16
  // No need to configure it in experimental
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.hogtechgh.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
    // Increase timeout for image optimization (default is 10s)
    minimumCacheTTL: 60,
    // Allow unoptimized images as fallback
    unoptimized: false,
    // Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Add headers to allow CORS for images
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Add redirects for SEO fixes
  async redirects() {
    return [
      // Redirect old product-category URLs to categories
      {
        source: '/product-category/:category/:subcategory*',
        destination: '/categories/:category',
        permanent: true,
      },
      {
        source: '/product-category/:category',
        destination: '/categories/:category',
        permanent: true,
      },
      // Redirect old product URLs if they exist
      {
        source: '/product-category/:path*',
        destination: '/categories',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "cimons-technologies",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles (Sentry v8)
  sourcemaps: {
    disable: true,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});