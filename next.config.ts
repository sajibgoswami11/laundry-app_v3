import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Suppress TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Suppress ESLint errors during build
  },
};

export default nextConfig;
