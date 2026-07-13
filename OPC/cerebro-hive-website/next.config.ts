import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = "OPC_cerebro_hive";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export in Next.js
  },
  basePath: isGithubActions ? `/${repo}` : '',
  assetPrefix: isGithubActions ? `/${repo}/` : '',
};

export default nextConfig;
