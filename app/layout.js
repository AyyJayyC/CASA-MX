/**
 * Global layout for the Next.js App Router.
 * Purpose: Provide global providers (React Query, Auth, Analytics) and navigation shell.
 */
import './globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import QueryProvider from '../lib/providers/QueryProvider';
import { AuthProvider } from '../lib/auth/AuthContext.jsx';
import { CreditsProvider } from '../lib/auth/CreditsContext.jsx';
import NavBar from '../components/NavBar.jsx';
import EmailVerificationBanner from '../components/EmailVerificationBanner.jsx';
import { DebugProvider } from '../lib/debug/DebugContext.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import ReferralTracker from '../components/ReferralTracker.jsx';
import FooterYear from '../components/FooterYear.jsx';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
  title: 'CASA MX - Tu ruta, tu decisión',
  description: 'Encuentra tu camino en el mercado inmobiliario. Ofertas reales, decisiones informadas. Negocia con confianza.',
  keywords: ['Propiedades en México', 'Compra venta de casas', 'Renta de departamentos', 'Bienes raíces', 'Inmuebles'],
  authors: [{ name: 'Casa-MX.com' }],
  icons: {
    icon: [
      { url: '/brand/favicon-ruta-clara.ico' },
      { url: '/brand/logo-mark.png', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/brand/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'CASA MX - Tu ruta, tu decisión',
    description: 'Ofertas reales. Decisiones informadas. Negocia con confianza.',
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Casa-MX.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CASA MX - Tu ruta, tu decisión',
    description: 'Ofertas reales. Decisiones informadas. Negocia con confianza.',
    images: ['/brand/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <DebugProvider>
          <ErrorBoundary>
            <AuthProvider>
              <CreditsProvider>
                <QueryProvider>
                <NavBar />
                <EmailVerificationBanner />
                <ReferralTracker />
                <main className="container mt-8">{children}</main>
                <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="container max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <p>© <FooterYear /> Casa-MX.com. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-4">
                      <Link href="/aviso-legal" className="hover:text-clay dark:hover:text-clay-400 transition-colors">Privacidad</Link>
                      <Link href="/terminos" className="hover:text-clay dark:hover:text-clay-400 transition-colors">Términos</Link>
                      <Link href="/cookie" className="hover:text-clay dark:hover:text-clay-400 transition-colors">Cookies</Link>
                    </div>
                  </div>
                </footer>
                <DebugPanel />
              </QueryProvider>
              </CreditsProvider>
            </AuthProvider>
          </ErrorBoundary>
        </DebugProvider>
      </body>
    </html>
  );
}
