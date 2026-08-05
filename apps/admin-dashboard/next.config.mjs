/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  transpilePackages: ['@local-fashion/shared-types', '@local-fashion/ui'],
};

export default nextConfig;
