import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['intuit-oauth'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'intuit-oauth'];
    return config;
  },
}

export default nextConfig
