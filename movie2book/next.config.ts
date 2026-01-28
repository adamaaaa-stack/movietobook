import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5gb',
    },
    proxyClientMaxBodySize: '5gb',
  },
};

export default nextConfig;
