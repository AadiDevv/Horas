import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Don't reveal that the app is powered by Next.js
  compiler: { removeConsole: process.env.NODE_ENV === "production" }, // Remove console logs in production
};

export default nextConfig;
