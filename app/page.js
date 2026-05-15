import Link from 'next/link';
import HomepageCarousel from '@/components/HomepageCarousel.jsx';

function ValueCard({ icon, title, description }) {
  return (
    <div className="text-center p-6 bg-sand-100 dark:bg-ink/50 rounded-xl border border-sand-200 dark:border-slate-700/30 hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-clay/10 rounded-full mb-4">
        <svg className="w-7 h-7 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-base font-semibold text-ink dark:text-sand-50 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-sm text-ink-muted dark:text-sand-200">{description}</p>
    </div>
  );
}

const ICONS = {
  transparencia: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  negociacion: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  datos: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  confianza: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  equidad: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
};

export default function Home() {
  return (
    <div>
      {/* Hero Section — Compact */}
      <section className="relative py-6 md:py-10 px-4 bg-gradient-to-br from-sand-50 via-white to-sand-100 dark:from-ink dark:via-ink/95 dark:to-ink/90">
        <div className="container max-w-2xl text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-sand-50 mb-3 leading-tight">
            Encuentra tu camino en el mercado inmobiliario.
          </h1>
          <p className="text-sm md:text-base text-ink-muted dark:text-sand-200 mb-5 max-w-lg mx-auto">
            Ofertas reales. Decisiones informadas. Negocia con confianza.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/publish-property"
              className="px-5 py-2.5 bg-clay hover:bg-clay-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Publicar propiedad
            </Link>
            <Link
              href="/properties"
              className="px-5 py-2.5 bg-white dark:bg-ink border-2 border-sand-200 dark:border-slate-700 text-ink dark:text-sand-50 hover:border-clay dark:hover:border-clay font-semibold text-sm rounded-lg transition-all"
            >
              Explorar propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* Full-Screen Hero Carousel */}
      <HomepageCarousel />

      {/* Value Cards */}
      <section className="py-16 px-4 bg-white dark:bg-ink/80">
        <div className="container max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-ink dark:text-sand-50 mb-4">
            Tu ruta, tu decisión
          </h2>
          <p className="text-center text-ink-muted dark:text-sand-200 mb-12 max-w-xl mx-auto text-sm md:text-base">
            Un camino claro que guía cada decisión inmobiliaria
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ValueCard icon={ICONS.transparencia} title="Transparencia" description="Información clara para todos." />
            <ValueCard icon={ICONS.negociacion} title="Negociación" description="Acuerdos justos entre personas." />
            <ValueCard icon={ICONS.datos} title="Datos reales" description="Decisiones basadas en información real." />
            <ValueCard icon={ICONS.confianza} title="Confianza" description="Seguridad y tranquilidad en cada paso." />
            <ValueCard icon={ICONS.equidad} title="Equidad" description="Un mercado justo para todos." />
          </div>
        </div>
      </section>
    </div>
  );
}
