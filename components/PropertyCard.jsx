'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#F5F3F0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8A8A8A" font-family="Arial" font-size="24">Casa-MX.com</text></svg>')}`;

export default function PropertyCard({ property }) {
  const imgSrc = property.imageUrls?.[0] || property.photos?.[0] || property.imageUrl || fallbackSvg;
  const isRental = property.listingType === 'for_rent';
  const price = isRental ? property.monthlyRent : property.price;
  const formattedPrice = price ? `$${price.toLocaleString('es-MX')} MXN` : null;
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const sqm = property.squareMeters;
  const metaParts = [];
  if (bedrooms != null) metaParts.push(`🛏 ${bedrooms} rec`);
  if (bathrooms != null) metaParts.push(`🛁 ${bathrooms} ba`);
  if (sqm != null) metaParts.push(`📐 ${sqm} m²`);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400"
    >
      <article className="border border-transparent hover:border-clay-400 rounded-lg transition-all duration-300">
        {/* Image — 4:3 ratio */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-neutral-200 dark:bg-neutral-800">
          <Image
            src={imgSrc}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
          {/* Promotion badge */}
          {property.promotionTier === 'carousel' && (
            <span className="absolute top-3 left-3 bg-clay-400 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
              🔥 Promocionado
            </span>
          )}
          {property.promotionTier === 'featured' && (
            <span className="absolute top-3 left-3 bg-clay-400 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
              ⭐ Destacado
            </span>
          )}
          {/* Price badge */}
          {formattedPrice && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold z-10">
              {isRental ? `${formattedPrice}/mes` : formattedPrice}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-1 pt-4 pb-3 space-y-1.5">
          <p className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {formattedPrice || (isRental ? 'Consultar' : 'Consultar')}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {property.colonia || ''}{property.colonia && property.propertyType ? ' · ' : ''}{property.propertyType || ''}
          </p>
          {metaParts.length > 0 && (
            <p className="text-[13px] text-neutral-400 dark:text-neutral-500">
              {metaParts.join(' | ')}
            </p>
          )}
          {/* Agency badge */}
          {property.seller?.agency?.name && (
            <p className="text-[13px] text-clay-400 font-medium">
              🏢 {property.seller.agency.name}
            </p>
          )}

          {/* Ver detalles — fade in on hover */}
          <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium text-clay-400">
              Ver detalles →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
