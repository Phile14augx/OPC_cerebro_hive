import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isGithubPages = process.env.DEPLOY_TARGET === "github-pages";
const repo = "OPC_cerebro_hive";
const basePath = isGithubPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : "standalone",
  poweredByHeader: false,
  transpilePackages: ["@cerebro/ai", "@cerebro/workflow", "@cerebro/db", "@cerebro/sdk"],
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
          source: "/solutions/:path*",
          destination: "/archive/solutions/:path*",
          permanent: true,
        },
      ];
    },
  }),
};

export default withBundleAnalyzer(
  nextConfig as Parameters<typeof withBundleAnalyzer>[0],
) as unknown as NextConfig;
