import Link from 'next/link';
import HeroSection from '@/components/HeroSection.jsx';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-clay-50 via-white to-clay-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Bienvenido a{' '}
            <span className="bg-gradient-to-r from-clay-400 to-clay-600 bg-clip-text text-transparent">
              Casa-MX.com
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Te acompanamos desde el inicio hasta el cierre: publicar, negociar y completar la venta o renta con confianza
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="
                px-8 py-4
                bg-gradient-to-br from-clay-400 to-clay-600
                hover:from-clay-500 hover:to-clay-700
                text-white font-semibold text-lg
                rounded-lg
                transition-all
                shadow-lg hover:shadow-xl
              "
            >
              Explorar Propiedades
            </Link>
            <Link
              href="/publish-property"
              className="
                px-8 py-4
                bg-white dark:bg-neutral-900
                hover:bg-neutral-50 dark:hover:bg-neutral-800
                text-neutral-900 dark:text-neutral-100
                border-2 border-neutral-200 dark:border-neutral-700
                font-semibold text-lg
                rounded-lg
                transition-all
              "
            >
              Publicar Propiedad
            </Link>
          </div>
        </div>
      </section>

      <HeroSection />

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-950">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-12">
            ¿Por qué Casa-MX.com?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-clay-100 dark:bg-clay-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-clay-600 dark:text-clay-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Búsqueda Fácil
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Encuentra propiedades con filtros inteligentes y búsqueda rápida
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-clay-100 dark:bg-clay-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-clay-600 dark:text-clay-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Acompanamiento de Inicio a Cierre
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Te ayudamos durante todo el proceso hasta que la propiedad se venda o se rente
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-clay-100 dark:bg-clay-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-clay-600 dark:text-clay-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Seguro y Confiable
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Verificamos todas las propiedades y usuarios para tu tranquilidad
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
