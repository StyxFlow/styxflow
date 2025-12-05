import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/typescript-config"],
  typescript:{
    ignoreBuildErrors:true,
  },
};

export default nextConfig;
