import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3", "pg"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
