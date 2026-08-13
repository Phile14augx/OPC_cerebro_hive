import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/app',
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@cerebro/db', '@cerebro/twin-contracts', '@cerebro/twin-domain'],
};

export default nextConfig;
