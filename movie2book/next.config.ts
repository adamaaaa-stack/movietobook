import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5gb',
    },
    proxyClientMaxBodySize: '5gb',
  },
  // CSS chunk "preloaded but not used" is a known Next.js/browser warning when
  // prefetched routes load CSS that isn’t used on the current page; safe to ignore.
};

export default nextConfig;
