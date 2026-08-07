/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cerebro/db', '@cerebro/ui', '@cerebro/experience', '@cerebro/data-core'],

  env: {
    PULSE_APP: 'true',
  },

  // Route all unresolved /api calls through the platform-api in development
  async rewrites() {
    const platformApiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL || 'http://localhost:8090';
    return [
      {
        source: '/proxy/platform/:path*',
        destination: `${platformApiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
