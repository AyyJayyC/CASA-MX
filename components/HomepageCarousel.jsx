'use client';
import React from 'react';
import Link from 'next/link';
import FeaturedCarousel from './FeaturedCarousel.jsx';
import { useProperties } from '@/lib/queries/properties';

function FallbackHero() {
  return (
    <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sand-100 dark:from-ink dark:via-ink/95 dark:to-ink/90 flex items-center justify-center">
      <div className="container max-w-2xl text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-sand-50 mb-3 leading-tight">
          Encuentra tu camino en el mercado inmobiliario.
        </h1>
        <p className="text-sm md:text-base text-ink-muted dark:text-sand-200 mb-6 max-w-lg mx-auto">
          Ofertas reales. Decisiones informadas. Negocia con confianza.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/publish-property" className="px-5 py-2.5 bg-clay hover:bg-clay-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg">
            Publicar propiedad
          </Link>
          <Link href="/properties" className="px-5 py-2.5 bg-white dark:bg-ink border-2 border-sand-200 dark:border-slate-700 text-ink dark:text-sand-50 hover:border-clay dark:hover:border-clay font-semibold text-sm rounded-lg transition-all">
            Explorar propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sand-100 dark:from-ink dark:via-ink/95 dark:to-ink/90 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-muted dark:text-sand-200">
        <div className="w-10 h-10 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
        <p className="text-sm">Cargando propiedades...</p>
      </div>
    </section>
  );
}

export default function HomepageCarousel() {
  const { data = [], isLoading, isError, error, refetch } = useProperties();

  if (isLoading && data.length === 0) {
    return <LoadingSkeleton />;
  }

  if (isError && data.length === 0) {
    return (
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-red-900/20 dark:via-ink dark:to-red-900/10 flex items-center justify-center">
        <div className="container max-w-2xl text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-sand-50 mb-3 leading-tight">
            Encuentra tu camino en el mercado inmobiliario.
          </h1>
          <p className="text-sm md:text-base text-ink-muted dark:text-sand-200 mb-4 max-w-lg mx-auto">
            Ofertas reales. Decisiones informadas. Negocia con confianza.
          </p>
          <p className="text-xs text-ink-muted dark:text-sand-200 mb-6">
            No pudimos cargar las propiedades destacadas.
            {error?.message && <span className="block mt-1 opacity-60">{error.message}</span>}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={() => refetch()} className="px-5 py-2.5 bg-clay hover:bg-clay-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg">
              Reintentar
            </button>
            <Link href="/properties" className="px-5 py-2.5 bg-white dark:bg-ink border-2 border-sand-200 dark:border-slate-700 text-ink dark:text-sand-50 hover:border-clay dark:hover:border-clay font-semibold text-sm rounded-lg transition-all">
              Explorar propiedades
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const promoted = data.filter(p => p.promotionTier === 'carousel');
  const carouselProps = promoted.length > 0 ? promoted : data.slice(0, 6);

  if (carouselProps.length === 0) {
    return <FallbackHero />;
  }

  return (
    <FeaturedCarousel properties={carouselProps} />
  );
}
