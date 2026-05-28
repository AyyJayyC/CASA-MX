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
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error'] }
      : false,
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'strict-dynamic' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'strict-dynamic' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.unsplash.com https://*.tile.openstreetmap.org https://maps.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://*.tile.openstreetmap.org https://api.casa-mx.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://hooks.stripe.com" },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
