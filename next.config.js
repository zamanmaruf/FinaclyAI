/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster compilation and reduced I/O
    if (dev) {
      config.watchOptions = {
        poll: false, // Disable polling for better performance
        aggregateTimeout: 600, // Increase timeout to reduce rebuilds
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'], // Ignore unnecessary files
      }
      
      // Reduce file system overhead
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])(.+)$/],
        immutablePaths: [/^(.+?[\\/]node_modules[\\/])(.+)$/],
      }
      
      // Optimize resolve for faster module resolution
      config.resolve.symlinks = false
      config.resolve.cacheWithContext = false
    }
    
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  // Increase timeout for CSS compilation
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
}

module.exports = nextConfig
