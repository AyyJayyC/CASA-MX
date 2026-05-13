'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="30">Casa-MX.com</text></svg>')}`;

function CarouselCard({ property }) {
  const imgSrc = property.imageUrls?.[0] || property.photos?.[0] || property.imageUrl || fallbackSvg;
  const isRental = property.listingType === 'for_rent';

  return (
    <Link
      href={`${FRONTEND_URL}/propiedades/${property.id}`}
      className="flex-shrink-0 w-72 sm:w-80 snap-start group rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <Image src={imgSrc} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="320px" />
        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow">
          🔥 Promocionado
        </span>
        <span className="absolute bottom-2 right-2 px-3 py-1 rounded-lg text-sm font-bold bg-black/60 text-white">
          {isRental ? `$${(property.monthlyRent || 0).toLocaleString('es-MX')}/mes` : `$${(property.price || 0).toLocaleString('es-MX')} MXN`}
        </span>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{property.title}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{property.colonia} · {property.propertyType || 'Propiedad'}</p>
      </div>
    </Link>
  );
}

export default function FeaturedCarousel({ properties }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, properties]);

  const scrollBy = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!properties || properties.length === 0) return null;

  return (
    <div className="relative space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <span>🔥</span> Propiedades Promocionadas
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scrollBy(-300)}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(300)}
            disabled={!canScrollRight}
            className="p-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((p) => (
          <CarouselCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
