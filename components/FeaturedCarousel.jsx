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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      </div>
      <div className="absolute inset-0 flex items-end pb-24 md:pb-32 px-6 md:px-16">
        <div className="container max-w-6xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow mb-4">
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
            className="inline-block px-6 py-3 bg-white text-neutral-900 font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
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

  // Auto-play every 5 seconds
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [total, next]);

  if (!properties || total === 0) return null;

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden bg-neutral-900">
      {/* Slides */}
      {properties.map((p, i) => (
        <CarouselSlide key={p.id} property={p} isActive={i === current} />
      ))}

      {/* Left arrow */}
      {total > 1 && (
        <button
          onClick={prev}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {total > 1 && (
        <button
          onClick={next}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-all"
          aria-label="Siguiente"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {properties.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
