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
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-end pb-32 md:pb-36 px-6 md:px-16">
        <div className="container max-w-6xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-clay text-white shadow mb-3">
            🔥 Promocionado
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {property.title}
          </h2>
          <p className="text-sm md:text-base text-white/80 mb-4 max-w-lg drop-shadow">
            {location}
          </p>
          <Link
            href={`/propiedades/${property.id}`}
            className="inline-block px-6 py-3 bg-white text-ink font-semibold rounded-lg hover:bg-sand-100 transition-colors shadow-lg"
          >
            {price} — Ver propiedad
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCarousel({ properties }) {
  const [current, setCurrent] = useState(0);
  const total = properties?.length || 0;

  const goTo = useCallback((index) => {
    setCurrent(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [total, next]);

  if (!properties || total === 0) return null;

  return (
    <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-ink">
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {properties.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-clay scale-125' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Ir a slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* CTA Overlay — always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-ink/40 via-ink/25 to-transparent px-4 py-3 md:px-6 md:py-4">
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
  );
}
