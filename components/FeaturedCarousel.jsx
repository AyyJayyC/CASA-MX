'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropertyCard from './PropertyCard.jsx';

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

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: 'smooth' });
  };

  if (!properties || properties.length === 0) return null;

  return (
    <div className="relative">
      {/* Arrow buttons */}
      <div className="hidden sm:block">
        <button
          onClick={() => scrollBy(-1)}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-clay-400 hover:bg-clay-500 flex items-center justify-center text-white shadow-lg transition-all ${
            !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ left: '-20px' }}
          aria-label="Anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scrollBy(1)}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-clay-400 hover:bg-clay-500 flex items-center justify-center text-white shadow-lg transition-all ${
            !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ right: '-20px' }}
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-80 sm:w-[340px] snap-start">
            <PropertyCard property={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
