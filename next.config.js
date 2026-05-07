/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/terms', destination: '/terminos', permanent: true },
      { source: '/privacy', destination: '/aviso-legal', permanent: true },
      { source: '/upload', destination: '/upload/sale', permanent: true },
    ];
  },
};

module.exports = nextConfig;
