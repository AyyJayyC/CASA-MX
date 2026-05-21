'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600"><rect width="100%" height="100%" fill="#1A1A18"/></svg>')}`;

function Arrow({ direction, onClick, visible }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Anterior' : 'Siguiente'}
      className={`absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-clay-400 hover:bg-clay-500 flex items-center justify-center text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay-300 ${
        direction === 'prev' ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
      }`}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity 300ms' }}
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
}

export default function HeroCarousel({ properties }) {
  const [current, setCurrent] = useState(0);

  const total = properties?.length || 0;

  const SLOTS = 4;

  // Build display array: real properties + placeholder cards to fill 4 slots
  const displayProps = [];
  for (let i = 0; i < Math.max(total, SLOTS); i++) {
    displayProps.push(i < total ? properties[i] : null);
  }
  const displayTotal = Math.max(total, SLOTS);

  const p = properties[current];
  if (!displayProps.length) return null;

  const isPlaceholder = !p;

  function prevSlide() {
    setCurrent((c) => (c === 0 ? displayTotal - 1 : c - 1));
  }

  function nextSlide() {
    setCurrent((c) => (c === displayTotal - 1 ? 0 : c + 1));
  }

  const imgSrc = !isPlaceholder ? (p.imageUrls?.[0] || p.photos?.[0] || p.imageUrl || fallbackSvg) : null;
  const isRental = !isPlaceholder && p.listingType === 'for_rent';
  const price = !isPlaceholder ? (isRental ? p.monthlyRent : p.price) : null;
  const formattedPrice = price ? `$${price.toLocaleString('es-MX')} MXN` : '';
  const direction = !isPlaceholder ? (p.listingType === 'for_rent' ? 'RENTA' : 'VENTA') : '';

  return (
    <section className="relative w-full overflow-hidden bg-[#1A1A18]" style={{ height: 'min(600px, 80vh)' }}>
      {/* Image with crossfade */}
      {!isPlaceholder ? (
        <div className="absolute inset-0">
          <Image src={imgSrc} alt={p.title || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <p className="text-white/30 text-5xl mb-4">🏠</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white/70 mb-2">Tu propiedad aquí</h2>
          <p className="text-white/40 max-w-xs text-sm mb-4">Promociona tu propiedad en este espacio frente a miles de visitantes.</p>
          <a href="/credits" className="px-5 py-2.5 bg-clay-400 hover:bg-clay-500 text-white text-sm font-semibold rounded-lg transition-all">
            Promocionar ahora
          </a>
        </div>
      )}

      {/* Text overlay bottom-left */}
      {!isPlaceholder && (
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/80 mb-2 font-medium">
            {direction}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 max-w-2xl">
            {p.title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clay-400" />
            <span className="text-lg sm:text-xl text-white font-medium">
              {formattedPrice}
            </span>
          </div>
          <Link
            href={`${FRONTEND_URL}/propiedades/${p.id}`}
            className="inline-block mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded-lg transition-all"
          >
            Ver detalles
          </Link>
        </div>
      )}

      {/* Dot pagination */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {displayProps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir a propiedad ${i + 1}`}
            className={`rounded-full transition-all ${
              i === current
                ? 'w-5 h-5 bg-clay-400'
                : 'w-3 h-3 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <Arrow direction="prev" onClick={prevSlide} visible />
      <Arrow direction="next" onClick={nextSlide} visible />
    </section>
  );
}
