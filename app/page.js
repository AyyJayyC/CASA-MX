import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Bienvenido a{' '}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              CasaMX
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Tu plataforma inmobiliaria donde encontrar la casa de tus sueños es fácil y rápido
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="
                px-8 py-4
                bg-gradient-to-br from-amber-400 to-yellow-600
                hover:from-amber-500 hover:to-yellow-700
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

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-950">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-12">
            ¿Por qué CasaMX?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Miles de Propiedades
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Acceso a una amplia variedad de casas, departamentos y terrenos
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
