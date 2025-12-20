import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
