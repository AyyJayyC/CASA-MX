'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FeaturedCarousel from './FeaturedCarousel.jsx';
import { useProperties } from '@/lib/queries/properties';
import { getCarouselSlides, getMostViewedProperties } from '@/lib/api/carousel';

function FallbackHero() {
  return (
    <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sand-100 dark:from-ink dark:via-ink/95 dark:to-ink/90 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 px-4">
        <img
          src="/brand/logo-primary.png"
          alt="Casa-MX.com"
          className="h-10 w-auto opacity-80 dark:opacity-60"
        />
        <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-sand-50 leading-tight text-center">
          Encuentra tu camino en el mercado inmobiliario.
        </h1>
        <p className="text-sm md:text-base text-ink-muted dark:text-sand-200 max-w-lg text-center">
          Ofertas reales. Decisiones informadas. Negocia con confianza.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 text-ink-muted dark:text-sand-200">
          <div className="w-6 h-6 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
          <p className="text-sm">Cargando...</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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

function CustomSlidesCarousel({ slides }) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  return (
    <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-ink">
      {slides.map((slide, i) => (
        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 first:opacity-100 first:z-10 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 max-w-2xl">{slide.title}</h2>
            {slide.subtitle && <p className="text-sm md:text-base text-white/80 mb-4 max-w-lg">{slide.subtitle}</p>}
            <Link href={slide.link} className="inline-block px-6 py-2.5 bg-clay hover:bg-clay-500 text-white text-sm font-semibold rounded-lg transition-all">
              {slide.buttonText || 'Ver más'}
            </Link>
          </div>
        </div>
      ))}

      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all" aria-label="Anterior">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all" aria-label="Siguiente">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-clay scale-125' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Ir a slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function HomepageCarousel() {
  const { data = [], isLoading, isError, error, refetch } = useProperties();
  const [customSlides, setCustomSlides] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);

  // Fetch custom slides and most-viewed as fallbacks
  useEffect(() => {
    let cancelled = false;
    async function loadFallbacks() {
      try {
        const [slides, viewed] = await Promise.all([
          getCarouselSlides().catch(() => []),
          getMostViewedProperties(6).catch(() => []),
        ]);
        if (!cancelled) {
          setCustomSlides(slides);
          setMostViewed(viewed);
        }
      } catch {
        // Silently fail — fallbacks are optional
      }
    }
    loadFallbacks();
    return () => { cancelled = true; };
  }, []);

  // Timeout bail: after 3 seconds, skip to fallback if nothing loaded yet
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const nothingLoaded = customSlides.length === 0 && mostViewed.length === 0 && data.length === 0;
  const showLoading = !timedOut && isLoading && nothingLoaded;

  // Bail to fallback if timed out and nothing loaded
  if (timedOut && nothingLoaded) {
    return <FallbackHero />;
  }

  if (showLoading) {
    return <LoadingSkeleton />;
  }

  // Priority 1: Custom carousel slides
  if (customSlides.length > 0) {
    return <CustomSlidesCarousel slides={customSlides} />;
  }

  // Priority 2: Promoted properties
  const promoted = data.filter(p => p.promotionTier === 'carousel');
  if (promoted.length > 0) {
    return <FeaturedCarousel properties={promoted} />;
  }

  // Priority 3: Most-viewed properties
  if (mostViewed.length > 0) {
    return <FeaturedCarousel properties={mostViewed} />;
  }

  // Priority 4: Latest properties
  if (data.length > 0) {
    return <FeaturedCarousel properties={data.slice(0, 6)} />;
  }

  // Priority 5: Error with retry
  if (isError) {
    return (
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sand-100 dark:from-ink dark:via-ink/95 dark:to-ink/90 flex items-center justify-center">
        <div className="container max-w-2xl text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-sand-50 mb-3 leading-tight">
            Encuentra tu camino en el mercado inmobiliario.
          </h1>
          <p className="text-sm md:text-base text-ink-muted dark:text-sand-200 mb-4 max-w-lg mx-auto">
            Ofertas reales. Decisiones informadas. Negocia con confianza.
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

  // Priority 6: Empty state — fallback hero
  return <FallbackHero />;
}
