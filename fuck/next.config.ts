/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move serverComponentsExternalPackages from experimental to root
  serverExternalPackages: ['mongodb', 'firebase', 'bcryptjs', 'jsonwebtoken'],
  
  // If you have other experimental features, keep them here
  experimental: {
    // Remove serverComponentsExternalPackages from here
  },
  
  // Other config options
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'], // Add any image domains you use
  },
};

module.exports = nextConfig;