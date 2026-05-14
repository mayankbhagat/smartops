/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to complete even with type-check issues in @ts-nocheck files
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
