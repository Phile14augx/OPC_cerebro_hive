/**
 * CerebroHive Platform - Next.js Configuration
 * 
 * Month 1 Implementation: DevOps Infrastructure
 * Configured with security headers from CerebroCyber™
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Security headers (applied to all pages)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Standard security headers
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Content Security Policy for dark intelligence UI
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https: blob:; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "connect-src 'self' https://*.cerebrohive.com https://*.anthropic.com https://*.openai.com; " +
              "frame-ancestors 'none';",
          },
          // CORS headers
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          },
          // CerebroHive branding
          {
            key: "X-Cerebro-Version",
            value: "1.0.0-beta",
          },
          {
            key: "X-Cerebro-Platform",
            value: "cerebrohive-enterprise",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ["localhost", "*.cerebrohive.com"],
  },

  // React strict mode
  reactStrictMode: true,

  // Output configuration for security headers
  output: "standalone",
};

export default nextConfig;