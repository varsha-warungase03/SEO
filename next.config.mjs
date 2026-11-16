
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bullmq", "ioredis"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@valkey/valkey-glide": false,
    };
    return config;
  },
};

export default nextConfig;
