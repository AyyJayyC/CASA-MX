/**
 * Global layout for the Next.js App Router.
 * Purpose: Provide global providers (React Query, Auth, Analytics) and navigation shell.
 */
import './globals.css';
import QueryProvider from '../lib/providers/QueryProvider';
import { AuthProvider } from '../lib/auth/AuthContext.jsx';
import NavBar from '../components/NavBar.jsx';
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
              <QueryProvider>
                <NavBar />
                <main className="container mt-8">{children}</main>
                <LoggingInitializer />
                <DebugPanel />
              </QueryProvider>
            </AuthProvider>
          </ErrorBoundary>
        </DebugProvider>
      </body>
    </html>
  );
}
