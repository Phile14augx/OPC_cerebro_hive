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
  },

  // Expose runtime env vars in SSR mode
  serverRuntimeConfig: {
    apiUrl: process.env.API_URL ?? "http://gateway:8900/api/v1",
  },

  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8900/api/v1",
    keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080",
    keycloakRealm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "cerebro",
    keycloakClientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "cerebro-web",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
