/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove appDir - it's no longer experimental in Next.js 14+
  webpack: (config, { isServer }) => {
    // Exclude archive folder from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/archive/**'],
    };
    return config;
  },
}

module.exports = nextConfig