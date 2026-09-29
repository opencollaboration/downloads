import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
