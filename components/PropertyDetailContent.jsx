"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  getAmenityMeta,
  getServiceMeta,
  groupAmenitiesByCategory,
} from "@/lib/constants/propertyServices";
import {
  FINANCING_SHORT_LABELS,
  FINANCING_ICONS,
} from "@/lib/constants/financing";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/propertyOptions";
import { getTagLabel } from "@/lib/constants/tagLabels";
import PropertyImageGallery from "@/components/PropertyImageGallery.jsx";

const ContactRequestModal = dynamic(() => import("@/components/ContactRequestModal.jsx"));
const MakeOfferModal = dynamic(() => import("@/components/MakeOfferModal.jsx"));
const PropertyAnalytics = dynamic(() => import("@/components/analytics/PropertyAnalytics.jsx"));
const RentalApplicationForm = dynamic(() => import("@/components/RentalApplicationForm.jsx"));
const SharePropertyButton = dynamic(() => import("@/components/SharePropertyButton.jsx"));
const PromotePropertyButton = dynamic(() => import("@/components/PromotePropertyButton.jsx"));

function getOwnerTagsList(tags) {
  if (!tags) return [];
  return [...(tags.perfil || []), ...(tags.zona || []), ...(tags.operacion || [])].slice(0, 4);
}

export default function PropertyDetailContent({ property }) {
  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="40">Casa-MX.com</text></svg>')}`;
  const galleryImages = property.imageUrls?.length
    ? property.imageUrls
    : property.photos?.length
      ? property.photos
      : property.imageUrl
        ? [property.imageUrl]
        : [fallbackImage];
  const isRental = property.listingType === "for_rent";
  const includedServices = Array.isArray(property.includedServices) ? property.includedServices : [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const financeOptions = Array.isArray(property.financeOptions) ? property.financeOptions : [];
  const groupedAmenities = groupAmenitiesByCategory(amenities);
  const features = [
    { icon: "🛏️", label: "Recámaras", value: property.bedrooms ?? "N/D" },
    { icon: "🚿", label: "Baños", value: property.bathrooms ?? "N/D" },
    { icon: "🏗️", label: "Construcción", value: property.squareMeters ? `${Number(property.squareMeters).toLocaleString("es-MX")} m²` : "N/D" },
    { icon: "🌳", label: "Terreno", value: property.lotSize ? `${Number(property.lotSize).toLocaleString("es-MX")} m²` : "N/D" },
    { icon: "🚗", label: "Estacionamiento", value: property.parkingSpaces ? `${property.parkingSpaces} cajones` : "N/D" },
    { icon: "🏢", label: "Pisos", value: property.floors ? `${property.floors}` : "N/D" },
    { icon: "📅", label: "Año const.", value: property.yearBuilt ? `${property.yearBuilt}` : "N/D" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <PropertyAnalytics propertyId={property.id} />

      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-4">
          <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-clay dark:hover:text-clay-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a propiedades
          </Link>
        </div>
      </div>

      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-0">
          <PropertyImageGallery images={galleryImages} title={property.title} />
        </div>
      </section>

      <div className="container max-w-7xl py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 flex-1">{property.title}</h1>
                <div className="shrink-0 pt-1">
                  <SharePropertyButton propertyId={property.id} propertyTitle={property.title} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base">{property.colonia} • {property.propertyType || "Propiedad"}</span>
              </div>
              <div className="text-4xl font-bold text-clay dark:text-clay">
                {isRental ? `$${(property.monthlyRent ?? 0).toLocaleString("es-MX")} MXN/mes` : `$${(property.price ?? 0).toLocaleString("es-MX")} MXN`}
              </div>
              {property.status && STATUS_LABELS[property.status] && property.status !== "disponible" && (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${STATUS_COLORS[property.status] || "bg-slate-100 text-slate-800"}`}>
                  {STATUS_LABELS[property.status]}
                  {property.availableFrom && (property.status === "preventa" || property.status === "en_remodelacion") && (
                    <> · Disponible {new Date(property.availableFrom).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</>
                  )}
                </div>
              )}
              {isRental && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.furnished && <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-md">Amueblada</span>}
                  {property.utilitiesIncluded && <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-md">Servicios incluidos</span>}
                  {includedServices.includes("Internet") && <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-medium rounded-md">Internet incluido</span>}
                  {property.petFriendly && <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-md">Pet Friendly</span>}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="text-center space-y-2">
                    <div className="text-3xl">{feature.icon}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">{feature.label}</div>
                    <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{feature.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {property.description && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Descripción</h2>
                <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Detalles adicionales</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Tipo</dt><dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.propertyType || "Propiedad"}</dd></div>
                <div><dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Ubicación</dt><dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.colonia}</dd></div>
                {isRental && property.securityDeposit && <div><dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Depósito</dt><dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">${property.securityDeposit.toLocaleString("es-MX")} MXN</dd></div>}
                {isRental && property.leaseTermMonths && <div><dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Contrato mínimo</dt><dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.leaseTermMonths} meses</dd></div>}
                <div><dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">ID de propiedad</dt><dd className="text-xs font-medium text-neutral-900 dark:text-neutral-100 font-mono">{property.id}</dd></div>
                <div>
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Publicado por</dt>
                  <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                    {property.owner || "Propietario"}
                    {property.seller?.agency?.name && <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal ml-1">· {property.seller.agency.name}</span>}
                  </dd>
                  {property.seller?.tags && getOwnerTagsList(property.seller.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {getOwnerTagsList(property.seller.tags).map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400">{getTagLabel(tag)}</span>)}
                    </div>
                  )}
                </div>
              </dl>
            </div>

            {includedServices.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Servicios incluidos</h2>
                <div className="flex flex-wrap gap-2">
                  {includedServices.map((service) => {
                    const meta = getServiceMeta(service);
                    return <span key={service} className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300">{meta?.icon && <span>{meta.icon}</span>}{meta?.label || service}</span>;
                  })}
                </div>
              </div>
            )}

            {Object.keys(groupedAmenities).length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-5">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Amenidades y equipamiento</h2>
                <div className="space-y-5">
                  {Object.entries(groupedAmenities).map(([categoryLabel, categoryAmenities]) => (
                    <div key={categoryLabel} className="space-y-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{categoryLabel}</div>
                      <div className="flex flex-wrap gap-2">
                        {categoryAmenities.map((amenity) => {
                          const meta = getAmenityMeta(amenity.value);
                          return <span key={meta.value} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">{meta?.icon && <span>{meta.icon}</span>}{meta?.label || amenity.value}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isRental && financeOptions.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Métodos de pago aceptados</h2>
                <div className="flex flex-wrap gap-2">
                  {financeOptions.map((option) => (
                    <span key={option} className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300">
                      {FINANCING_ICONS[option] && <span>{FINANCING_ICONS[option]}</span>}
                      {FINANCING_SHORT_LABELS[option] || option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-6">
              {isRental ? (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Solicitar Renta</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Completa la solicitud y el propietario revisará tu perfil.</p>
                  </div>
                  <RentalApplicationForm propertyId={property.id} monthlyRent={property.monthlyRent} />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">¿Te interesa esta propiedad?</h2>
                  {property.price && <div className="text-2xl font-bold text-clay dark:text-clay">${property.price.toLocaleString("es-MX")} MXN</div>}
                  <MakeOfferModal propertyId={property.id} askingPrice={property.price} />
                  <div className="relative flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">o</span>
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                  <ContactRequestModal propertyId={property.id} />
                </>
              )}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <SharePropertyButton propertyId={property.id} propertyTitle={property.title} />
              </div>
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <PromotePropertyButton propertyId={property.id} propertyTitle={property.title} sellerId={property.sellerId} />
              </div>
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {isRental ? "El propietario revisará tu solicitud y se pondrá en contacto contigo directamente." : "El vendedor revisará tu solicitud y se pondrá en contacto contigo directamente."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
