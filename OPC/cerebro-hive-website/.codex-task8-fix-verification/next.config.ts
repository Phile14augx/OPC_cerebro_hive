import type { NextConfig } from "next";

// STATIC_EXPORT=true → GitHub Pages (no server, no API routes)
// Default           → SSR standalone for Docker / Kubernetes
const isStaticExport = process.env.STATIC_EXPORT === "true";

const isGithubPages =
  process.env.GITHUB_ACTIONS === "true" && process.env.IS_FTP_DEPLOY !== "true";
const repo = "OPC_cerebro_hive";
const basePath = isGithubPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  // Standalone output enables Docker multi-stage build with minimal bundle
  output: isStaticExport ? "export" : "standalone",

  poweredByHeader: false,
  trailingSlash: isStaticExport,

  basePath: isStaticExport ? basePath : "",
  assetPrefix: isStaticExport && isGithubPages ? `/${repo}/` : "",

  images: {
    unoptimized: isStaticExport,
    remotePatterns: isStaticExport ? [] : [
      { protocol: "https", hostname: "**.cerebrohive.com" },
      { protocol: "http",  hostname: "localhost" },
    ],
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: isStaticExport ? basePath : "",
    // Migrated from serverRuntimeConfig / publicRuntimeConfig (removed in Next.js 16)
    API_URL: process.env.API_URL ?? "http://gateway:8900/api/v1",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8900/api/v1",
    NEXT_PUBLIC_KEYCLOAK_URL:
      process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080",
    NEXT_PUBLIC_KEYCLOAK_REALM:
      process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "cerebro",
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:
      process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "cerebro-web",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
