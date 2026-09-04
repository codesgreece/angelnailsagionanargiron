import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn1.treatwell.net" },
      { protocol: "https", hostname: "**.treatwell.net" },
    ],
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
