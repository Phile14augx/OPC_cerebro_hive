import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isGithubPages = process.env.GITHUB_ACTIONS === "true" && process.env.IS_FTP_DEPLOY !== "true";
const repo = "OPC_cerebro_hive";
const basePath = isGithubPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js" to scanners
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: isGithubPages ? `/${repo}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    return [
      {
        source: '/solutions/:path*',
        destination: '/archive/solutions/:path*',
        permanent: true,
      },
      // specific old products could be redirected here, but let's just handle it via the archive data layer
    ];
  },
};

export default withBundleAnalyzer(nextConfig);