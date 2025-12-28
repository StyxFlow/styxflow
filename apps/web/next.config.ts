import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Turbopack resolves modules from the app workspace
  // to avoid dev-time root mis-detection and missing modules.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    // Point to the monorepo root so Next can resolve its own package
    // even with workspace hoisting and security restrictions.
    root: path.resolve(__dirname, "../.."),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  transpilePackages: ["@repo/typescript-config"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
