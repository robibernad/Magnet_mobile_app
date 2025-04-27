/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pwa: {
    dest: "public",        // Unde va genera service worker-ul
    register: true,         // Înregistrează service worker-ul automat
    skipWaiting: true,      // Face update instant la noul service worker
    disable: process.env.NODE_ENV === "development", // Dezactivează PWA pe localhost (dev)
  },
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
});

export default nextConfig;
