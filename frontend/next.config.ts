import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: { 
    removeConsole: process.env.NODE_ENV === "production" 
  },

  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  
  webpack: (config, { isServer }) => {
    // Hot reload pour Docker (mac/Windows)
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
