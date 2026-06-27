/**
 * PropertyCard component (client)
 * Purpose: Present minimal property information in a card for listings.
 * Design: Gold-accented minimalist card with 16:9 image, price badge, and clean typography
 * Phase 2 Enhancements: Performance optimized, accessibility improved, blur placeholder added
 * Checkpoint 4: Conditional rendering for rental properties (monthlyRent, furnished, utilities badges)
 */
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAmenityMeta,
  getServiceMeta,
} from "../lib/constants/propertyServices";
import {
  CONDITION_LABELS,
  CONDITION_COLORS,
  FURNISHED_LABELS,
  PARKING_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../lib/constants/propertyOptions";
import VerificationBadges from "@/components/VerificationBadges";
import { getTagLabel } from "../lib/constants/tagLabels";

function getOwnerTags(tags) {
  if (!tags) return null;
  const all = [];
  if (tags.perfil?.length) all.push(...tags.perfil);
  if (tags.zona?.length) all.push(...tags.zona);
  if (tags.operacion?.length) all.push(...tags.operacion);
  return all.slice(0, 3);
}

/**
 * @param {{property: Object}} props
 * Property object expected to have: id, title, colonia, propertyType, price, description, imageUrl, owner
 * Rental properties also have: listingType, monthlyRent, furnished, utilitiesIncluded
 */
const PropertyCard = React.memo(function PropertyCard({ property }) {
  // Fallback image if none provided
  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="32">Casa-MX.com</text></svg>')}`;
  const imageUrl =
    property.imageUrls?.[0] ||
    property.photos?.[0] ||
    property.imageUrl ||
    fallbackImage;
  const description = property.description || "Sin descripción disponible";
  const owner = property.owner || "Propietario";
  const ownerIdentityVerified = Boolean(
    property?.seller?.officialIdVerified ?? property?.officialIdVerified,
  );
  const ownerIdentityUploaded = Boolean(property?.seller?.officialIdUploaded);
  const ownerPaidSubscriber = Boolean(property?.seller?.paidSubscriber);
  const isRental = property.listingType === "for_rent";
  const includedServices = Array.isArray(property.includedServices)
    ? property.includedServices
    : [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const visibleAmenities = amenities
    .slice(0, 5)
    .map((amenity) => getAmenityMeta(amenity));
  const remainingAmenities = Math.max(
    0,
    amenities.length - visibleAmenities.length,
  );
  const visibleServices = includedServices
    .slice(0, 4)
    .map((service) => getServiceMeta(service));

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 rounded-lg"
      aria-label={`Ver detalles de ${property.title} en ${property.colonia}`}
    >
      <article
        className="
          bg-white dark:bg-neutral-900 
          border border-neutral-200 dark:border-neutral-800 
          rounded-lg 
          overflow-hidden
          shadow-sm hover:shadow-md
          transition-shadow duration-200
          h-full
          flex flex-col
        "
        role="article"
        aria-labelledby={`property-title-${property.id}`}
      >
        {/* Image Section with Price Badge */}
        <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`Imagen de ${property.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=="
          />

          {/* Promotion badges */}
          {property.promotionTier === "carousel" && (
            <div className="absolute top-3 left-3 bg-clay text-white px-2 py-1 rounded-full text-xs font-bold shadow">
              🔥 Promocionado
            </div>
          )}
          {property.promotionTier === "featured" && (
            <div className="absolute top-3 left-3 bg-clay text-white px-2 py-1 rounded-full text-xs font-bold shadow">
              ⭐ Destacado
            </div>
          )}

          {/* Price/Rent Badge - Gold Gradient Overlay */}
          <div
            className="
              absolute top-3 right-3
              bg-clay
              text-white
              px-3 py-1.5
              rounded-md
              shadow-lg
              font-semibold text-sm
            "
            aria-label={
              isRental
                ? `Renta mensual: ${(property.monthlyRent ?? 0).toLocaleString("es-MX")} pesos mexicanos`
                : `Precio: ${(property.price ?? 0).toLocaleString("es-MX")} pesos mexicanos`
            }
          >
            {isRental
              ? `$${(property.monthlyRent ?? 0).toLocaleString("es-MX")}/mes`
              : `$${(property.price ?? 0).toLocaleString("es-MX")} MXN`}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Address Title - 1 line clamp */}
          <h3
            id={`property-title-${property.id}`}
            className="
              text-xl font-semibold 
              text-neutral-900 dark:text-neutral-100
              line-clamp-1
              mb-2
            "
          >
            {property.title}
          </h3>

          {/* Location + Size */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            <span className="sr-only">Ubicación:</span>
            {property.colonia} • {property.propertyType || "Propiedad"}
          </p>
          {(property.squareMeters || property.lotSize) && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-3">
              {property.squareMeters
                ? `${Number(property.squareMeters).toLocaleString("es-MX")} m² const.`
                : ""}
              {property.squareMeters && property.lotSize ? " · " : ""}
              {property.lotSize
                ? `${Number(property.lotSize).toLocaleString("es-MX")} m² terreno`
                : ""}
            </p>
          )}

          {/* Property Badges (Condition, Status, Furnished, Parking, Rental) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {property.condition && CONDITION_LABELS[property.condition] && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${CONDITION_COLORS[property.condition] || "bg-slate-100 text-slate-800"}`}
              >
                {CONDITION_LABELS[property.condition]}
              </span>
            )}
            {property.status &&
              STATUS_LABELS[property.status] &&
              property.status !== "disponible" && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[property.status] || "bg-slate-100 text-slate-800"}`}
                >
                  {STATUS_LABELS[property.status]}
                  {property.availableFrom &&
                    (property.status === "preventa" ||
                      property.status === "en_remodelacion") && (
                      <>
                        {" "}
                        ·{" "}
                        {new Date(property.availableFrom).toLocaleDateString(
                          "es-MX",
                          { month: "short", day: "numeric" },
                        )}
                      </>
                    )}
                </span>
              )}
            {property.visibility === "private" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                🔒 Privado
              </span>
            )}
            {property.furnished && FURNISHED_LABELS[property.furnished] && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {FURNISHED_LABELS[property.furnished]}
              </span>
            )}
            {property.parkingType &&
              PARKING_TYPE_LABELS[property.parkingType] && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400">
                  {PARKING_TYPE_LABELS[property.parkingType]}
                </span>
              )}
            {property.petFriendly && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                🐾 Mascotas
              </span>
            )}
            {isRental && property.utilitiesIncluded && (
              <span
                className="
                  inline-flex items-center gap-1
                  px-2 py-1
                  bg-blue-100 dark:bg-blue-900/30
                  text-blue-700 dark:text-blue-400
                  text-xs font-medium
                  rounded-md
                "
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                Servicios incluidos
              </span>
            )}
          </div>

          {(visibleServices.length > 0 || visibleAmenities.length > 0) && (
            <div className="mb-3 space-y-2">
              {visibleServices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visibleServices.map((service) => (
                    <span
                      key={service.value}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      <span aria-hidden="true">{service.emoji}</span>
                      <span className="truncate">{service.label}</span>
                    </span>
                  ))}
                </div>
              )}

              {visibleAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visibleAmenities.map((amenity) => (
                    <span
                      key={amenity.value}
                      title={amenity.label}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clay/10 text-sm ring-1 ring-amber-200 dark:bg-clay-900/20 dark:ring-amber-800"
                    >
                      <span aria-hidden="true">{amenity.emoji}</span>
                    </span>
                  ))}
                  {remainingAmenities > 0 && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      +{remainingAmenities} más
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description - 2 line clamp */}
          <p
            className="
            text-sm 
            text-neutral-600 dark:text-neutral-400
            line-clamp-2
            mb-4
            flex-1
          "
          >
            {description}
          </p>

          {/* Footer with Border Top */}
          <div
            className="
            pt-4 
            border-t border-neutral-200 dark:border-neutral-800
            flex items-center justify-between
          "
          >
            {/* Owner Info */}
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">
                <span className="sr-only">Publicado</span> Por: {owner}
                {property.seller?.agency?.name && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-neutral-400">
                      {property.seller.agency.name}
                    </span>
                  </>
                )}
              </span>
              {(ownerIdentityVerified ||
                ownerIdentityUploaded ||
                ownerPaidSubscriber) && (
                <div className="mt-1">
                  <VerificationBadges
                    compact
                    identityVerified={ownerIdentityVerified}
                    identityUploaded={ownerIdentityUploaded}
                    paidSubscriber={ownerPaidSubscriber}
                  />
                </div>
              )}
              {property.seller?.tags &&
                getOwnerTags(property.seller.tags)?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getOwnerTags(property.seller.tags).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                      >
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            {/* View Details Link - Gold */}
            <span
              className="
                text-sm font-medium
                text-clay dark:text-clay
                group-hover:text-clay dark:group-hover:text-amber-300
                flex items-center gap-1
              "
              aria-hidden="true"
            >
              Ver detalles
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
});

PropertyCard.displayName = 'PropertyCard';
export default PropertyCard;
