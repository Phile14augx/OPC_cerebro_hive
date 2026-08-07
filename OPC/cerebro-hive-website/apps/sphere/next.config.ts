import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cerebro/db', '@cerebro/ui'],
  compress: true,
  poweredByHeader: false,

  env: { SPHERE_APP: 'true' },

  async rewrites() {
    const platformApiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL || 'http://localhost:8090';
    return [
      { source: '/proxy/platform/:path*', destination: `${platformApiUrl}/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Cerebro-Product', value: 'CerebroSphere' },
        ],
      },
    ];
  },

  reactStrictMode: true,
};

export default nextConfig;
