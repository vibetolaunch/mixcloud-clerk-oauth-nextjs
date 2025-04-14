import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["thumbnailer.mixcloud.com"],
  },
};

export default nextConfig;
