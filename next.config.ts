import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Local demo photography is committed to /public/images. Disabling the
    // optimizer keeps `next build` self-contained in environments without sharp.
    unoptimized: true,
  },
};

export default nextConfig;
