'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="100%" height="100%" fill="#1a1a2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="40">Casa-MX.com</text></svg>')}`;

function CarouselSlide({ property, isActive }) {
  const imgSrc = property.imageUrls?.[0] || property.photos?.[0] || property.imageUrl || FALLBACK_SVG;
  const isRental = property.listingType === 'for_rent';
  const price = isRental
    ? `$${(property.monthlyRent || 0).toLocaleString('es-MX')}/mes`
    : `$${(property.price || 0).toLocaleString('es-MX')} MXN`;

  const location = [property.colonia, property.ciudad, property.estado].filter(Boolean).join(', ');

  return (
    <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
      <div className="absolute inset-0">
        <Image src={imgSrc} alt={property.title} fill className="object-cover" priority={isActive} sizes="100vw" />
      </div>
      {/* Top banner — thin, minimal image obstruction */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-ink/50 to-transparent px-3 py-2 md:px-5 md:py-2.5 z-10">
        {/* Desktop: full detail line */}
        <div className="hidden md:flex items-center gap-3 text-white">
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-clay">🔥 Promocionado</span>
          <span className="font-semibold text-sm truncate max-w-[280px]">{property.title}</span>
          <span className="text-white/60 text-xs truncate max-w-[200px] hidden lg:block">{location}</span>
          <Link href={`/properties/${property.id}`} className="ml-auto shrink-0 px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors">
            {price} Ver ›
          </Link>
        </div>
        {/* Mobile: minimal single line */}
        <div className="md:hidden flex items-center justify-between text-white">
          <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-clay">🔥 Promocionado</span>
          <Link href={`/properties/${property.id}`} className="ml-auto shrink-0 px-2 py-0.5 bg-white/15 hover:bg-white/25 rounded text-[11px] font-semibold">
            {price} Ver ›
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCarousel({ properties }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const total = Math.min(properties?.length || 0, 6);

  const goTo = useCallback((index) => {
    setCurrent(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) next();
      else prev();
    }
  }, [touchStart, touchEnd, next, prev, minSwipeDistance]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [total, next]);

  if (!properties || total === 0) {
    return (
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-ink flex items-center justify-center">
        <p className="text-white/40 text-sm">Sin propiedades destacadas</p>
      </section>
    );
  }

  return (
    <>
      <section
      className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-ink"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {properties.map((p, i) => (
        <CarouselSlide key={p.id} property={p} isActive={i === current} />
      ))}

      {/* Nav arrows */}
      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all" aria-label="Anterior">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all" aria-label="Siguiente">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          {properties.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-clay scale-125' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Ir a slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* CTA Overlay — always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-ink/40 via-ink/25 to-transparent px-4 py-3 md:px-6 md:py-4 hidden md:block">
        <div className="container max-w-3xl text-center">
          <h2 className="text-sm md:text-lg font-bold text-white mb-0.5 drop-shadow">
            Encuentra tu camino en el mercado inmobiliario.
          </h2>
          <p className="hidden md:block text-xs text-white/60 mb-2 max-w-lg mx-auto">
            Ofertas reales. Decisiones informadas. Negocia con confianza.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/publish-property" className="px-4 py-1.5 md:px-5 md:py-2 bg-clay hover:bg-clay-500 text-white font-semibold text-xs md:text-sm rounded-lg transition-all shadow-md">
              Publicar propiedad
            </Link>
            <Link href="/properties" className="px-4 py-1.5 md:px-5 md:py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs md:text-sm rounded-lg transition-all">
              Explorar propiedades
            </Link>
          </div>
        </div>
      </div>
    </section>

      {/* Mobile CTA — below carousel */}
      <div className="block md:hidden bg-gradient-to-br from-sand-50 to-sand-100 dark:from-ink dark:to-ink/90 px-4 py-5 text-center">
        <h2 className="text-sm font-bold text-ink dark:text-sand-50 mb-1">
          Encuentra tu camino en el mercado inmobiliario.
        </h2>
        <p className="text-xs text-ink-muted dark:text-sand-200 mb-3">
          Ofertas reales. Decisiones informadas.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/publish-property" className="px-4 py-2 bg-clay hover:bg-clay-500 text-white font-semibold text-sm rounded-lg transition-all">
            Publicar propiedad
          </Link>
          <Link href="/properties" className="px-4 py-2 bg-white dark:bg-ink border-2 border-sand-200 dark:border-slate-700 text-ink dark:text-sand-50 hover:border-clay font-semibold text-sm rounded-lg transition-all">
            Explorar propiedades
          </Link>
        </div>
      </div>
    </>
  );
}
