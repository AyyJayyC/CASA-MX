/** @type {import('next').NextConfig} */
const vercelEnv = process.env.VERCEL_ENV;
const isProd = vercelEnv === 'production' || (!vercelEnv && process.env.NODE_ENV === 'production');
const isPreview = vercelEnv === 'preview';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
let apiOrigin;
try { apiOrigin = new URL(apiUrl).origin; } catch { apiOrigin = 'http://localhost:3001'; }

const cspProduction = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.unsplash.com https://*.tile.openstreetmap.org https://maps.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' https://api.stripe.com https://*.tile.openstreetmap.org ${apiOrigin}`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://hooks.stripe.com",
].join('; ');

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
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ];

    // Production: strict CSP (Next.js auto-adds nonces to its own scripts)
    // Development: omit CSP — it blocks Next.js dev inline scripts, and the backend Helmet already covers API
    if (isProd) {
      baseHeaders.push({ key: 'Content-Security-Policy', value: cspProduction });
    }

    return [{ source: '/(.*)', headers: baseHeaders }];
  },
};

module.exports = nextConfig;
