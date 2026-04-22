/**
 * Global layout for the Next.js App Router.
 * Purpose: Provide global providers (React Query, Auth, Analytics) and navigation shell.
 */
import './globals.css';
import Link from 'next/link';
import QueryProvider from '../lib/providers/QueryProvider';
import { AuthProvider } from '../lib/auth/AuthContext.jsx';
import { CreditsProvider } from '../lib/auth/CreditsContext.jsx';
import NavBar from '../components/NavBar.jsx';
import EmailVerificationBanner from '../components/EmailVerificationBanner.jsx';
import { DebugProvider } from '../lib/debug/DebugContext.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import LoggingInitializer from '../components/LoggingInitializer.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
  title: 'CASA MX - Plataforma Inmobiliaria de México',
  description: 'Busca, vende y alquila propiedades en México. Plataforma de bienes raíces con filtros avanzados, aplicaciones de alquiler y más.',
  keywords: ['Propiedades en México', 'Compra venta de casas', 'Renta de departamentos', 'Bienes raíces', 'Inmuebles'],
  authors: [{ name: 'CASA MX' }],
  openGraph: {
    title: 'CASA MX - Tu Plataforma Inmobiliaria',
    description: 'Encuentra tu hogar o invierte en propiedades en México',
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <DebugProvider>
          <ErrorBoundary>
            <AuthProvider>
              <CreditsProvider>
                <QueryProvider>
                <NavBar />
                <EmailVerificationBanner />
                <main className="container mt-8">{children}</main>
                <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="container max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <p>© {new Date().getFullYear()} CasaMX. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-4">
                      <Link href="/aviso-legal" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Privacidad</Link>
                      <Link href="/terminos" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Términos</Link>
                      <Link href="/cookie" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Cookies</Link>
                    </div>
                  </div>
                </footer>
                <LoggingInitializer />
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
