/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Keep intuit-oauth externalized for server bundling
    config.externals = [...(config.externals || []), 'intuit-oauth']
    return config
  },
}

module.exports = nextConfig