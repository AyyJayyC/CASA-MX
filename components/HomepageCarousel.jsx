'use client';
import React from 'react';
import Link from 'next/link';
import FeaturedCarousel from './FeaturedCarousel.jsx';
import { useProperties } from '@/lib/queries/properties';

export default function HomepageCarousel() {
  const { data = [] } = useProperties();
  const promoted = data.filter(p => p.promotionTier === 'carousel');
  const carouselProps = promoted.length > 0 ? promoted : data.slice(0, 6);

  if (carouselProps.length === 0) {
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

  return (
    <FeaturedCarousel properties={carouselProps} />
  );
}
