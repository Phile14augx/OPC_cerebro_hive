import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isGithubPages = process.env.GITHUB_ACTIONS === "true" && process.env.IS_FTP_DEPLOY !== "true";
const repo = "OPC_cerebro_hive";
const basePath = isGithubPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : "standalone",
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: isGithubPages ? `/${repo}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(!isGithubPages && {
    async redirects() {
      return [
        {
          source: '/solutions/:path*',
          destination: '/archive/solutions/:path*',
          permanent: true,
        },
      ];
    },
  }),
};

export default withBundleAnalyzer(nextConfig);