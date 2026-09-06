import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Prefer sharp retina sizes so large desktop heroes don't look soft.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [64, 96, 128, 256, 384, 512],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90, 95],
    remotePatterns: [
      { protocol: "https", hostname: "cdn1.treatwell.net" },
      { protocol: "https", hostname: "**.treatwell.net" },
    ],
  },
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "postprocessing",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
