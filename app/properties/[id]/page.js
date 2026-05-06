/**
 * Property detail page
 * Purpose: Show property details with image gallery, information, and contact form.
 * Design: Hero image section, two-column layout, feature grid, contact card
 * Checkpoint 5: Added rental application form for rental properties
 */
import { getPropertyById } from '../../../lib/queries/properties';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PropertyImageGallery from '../../../components/PropertyImageGallery.jsx';
import { getAmenityMeta, getServiceMeta, groupAmenitiesByCategory } from '../../../lib/constants/propertyServices';
import { FINANCING_SHORT_LABELS, FINANCING_ICONS } from '../../../lib/constants/financing';

const ContactRequestModal = dynamic(() => import('../../../components/ContactRequestModal.jsx'));
const MakeOfferModal = dynamic(() => import('../../../components/MakeOfferModal.jsx'));
const PropertyAnalytics = dynamic(() => import('../../../components/analytics/PropertyAnalytics.jsx'));
const RentalApplicationForm = dynamic(() => import('../../../components/RentalApplicationForm.jsx'));

export default async function PropertyDetail({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Propiedad no encontrada
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Esta propiedad no existe o ha sido eliminada.
          </p>
          <Link 
            href="/properties"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-gradient-to-br from-amber-400 to-yellow-600
              hover:from-amber-500 hover:to-yellow-700
              text-white font-semibold rounded-lg
              transition-all
            "
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    );
  }

  // Fallback values
  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="40">Casa-MX.com</text></svg>')}`;
  const galleryImages = property.imageUrls?.length
    ? property.imageUrls
    : property.photos?.length
      ? property.photos
      : property.imageUrl
        ? [property.imageUrl]
        : [fallbackImage];
  const isRental = property.listingType === 'for_rent';
  const includedServices = Array.isArray(property.includedServices) ? property.includedServices : [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const financeOptions = Array.isArray(property.financeOptions) ? property.financeOptions : [];
  const groupedAmenities = groupAmenitiesByCategory(amenities);
  const features = [
    { icon: '🛏️', label: 'Recámaras', value: property.bedrooms ?? 'N/D' },
    { icon: '🚿', label: 'Baños', value: property.bathrooms ?? 'N/D' },
    { icon: '📐', label: 'Área', value: property.squareMeters ? `${property.squareMeters} m²` : 'N/D' },
    { icon: '🚗', label: 'Estacionamiento', value: includedServices.includes('Estacionamiento') ? 'Incluido' : 'No incluido' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <PropertyAnalytics propertyId={property.id} />
      
      {/* Back Button */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-4">
          <Link 
            href="/properties"
            className="
              inline-flex items-center gap-2
              text-sm font-medium
              text-neutral-600 dark:text-neutral-400
              hover:text-amber-600 dark:hover:text-amber-400
              transition-colors
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a propiedades
          </Link>
        </div>
      </div>

      {/* Image Gallery Section */}
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-0">
          <PropertyImageGallery images={galleryImages} title={property.title} />
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-7xl py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base">{property.colonia} • {property.propertyType || 'Propiedad'}</span>
              </div>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {isRental 
                  ? `$${property.monthlyRent.toLocaleString('es-MX')} MXN/mes`
                  : `$${property.price.toLocaleString('es-MX')} MXN`
                }
              </div>
              
              {/* Rental-specific badges */}
              {isRental && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.furnished && (
                    <span className="
                      inline-flex items-center gap-1
                      px-3 py-1
                      bg-green-100 dark:bg-green-900/30
                      text-green-700 dark:text-green-400
                      text-sm font-medium
                      rounded-md
                    ">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      Amueblada
                    </span>
                  )}
                  {property.utilitiesIncluded && (
                    <span className="
                      inline-flex items-center gap-1
                      px-3 py-1
                      bg-blue-100 dark:bg-blue-900/30
                      text-blue-700 dark:text-blue-400
                      text-sm font-medium
                      rounded-md
                    ">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                      Servicios incluidos
                    </span>
                  )}
                  {includedServices.includes('Internet') && (
                    <span className="
                      inline-flex items-center gap-1
                      px-3 py-1
                      bg-violet-100 dark:bg-violet-900/30
                      text-violet-700 dark:text-violet-400
                      text-sm font-medium
                      rounded-md
                    ">
                      Internet incluido
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="
              grid grid-cols-2 sm:grid-cols-4 gap-4
              p-6
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg
            ">
              {features.map((feature, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <div className="text-3xl">{feature.icon}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {feature.label}
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {feature.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="
              p-6
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg
              space-y-4
            ">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Descripción
              </h2>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                {property.description || 'Esta hermosa propiedad ofrece un espacio ideal para vivir. Con excelente ubicación y acabados de calidad, es perfecta para familias que buscan comodidad y estilo.'}
              </p>
            </div>

            {/* Additional Details */}
            <div className="
              p-6
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg
              space-y-4
            ">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Detalles adicionales
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Tipo</dt>
                  <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.propertyType || 'Propiedad'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Ubicación</dt>
                  <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.colonia}</dd>
                </div>
                {isRental && property.securityDeposit && (
                  <div>
                    <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Depósito</dt>
                    <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      ${property.securityDeposit.toLocaleString('es-MX')} MXN
                    </dd>
                  </div>
                )}
                {isRental && property.leaseTermMonths && (
                  <div>
                    <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Contrato mínimo</dt>
                    <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      {property.leaseTermMonths} meses
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">ID de propiedad</dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-neutral-100 font-mono">{property.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Publicado por</dt>
                  <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{property.owner || 'Propietario'}</dd>
                </div>
              </dl>
            </div>

            {includedServices.length > 0 && (
              <div className="
                p-6
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-lg
                space-y-4
              ">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Servicios incluidos
                </h2>
                <div className="flex flex-wrap gap-2">
                  {includedServices.map((service) => {
                    const meta = getServiceMeta(service);

                    return (
                    <span
                      key={service}
                      className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      <span className="mr-1" aria-hidden="true">{meta.emoji}</span>
                      {meta.label}
                    </span>
                    );
                  })}
                </div>
              </div>
            )}

            {amenities.length > 0 && (
              <div className="
                p-6
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-lg
                space-y-4
              ">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Amenidades y equipamiento
                </h2>
                <div className="space-y-5">
                  {Object.entries(groupedAmenities).map(([categoryLabel, categoryAmenities]) => (
                    <div key={categoryLabel} className="space-y-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                        {categoryLabel}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categoryAmenities.map((amenity) => {
                          const meta = getAmenityMeta(amenity.value);
                          return (
                            <span
                              key={meta.value}
                              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            >
                              <span aria-hidden="true">{meta.emoji}</span>
                              <span>{meta.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financing Options (Sale only) */}
            {!isRental && financeOptions.length > 0 && (
              <div className="
                p-6
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-lg
                space-y-4
              ">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Métodos de pago aceptados
                </h2>
                <div className="flex flex-wrap gap-2">
                  {financeOptions.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full"
                    >
                      <span>{FINANCING_ICONS[option] ?? '✅'}</span>
                      <span>{FINANCING_SHORT_LABELS[option] ?? option}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Card or Rental Application */}
          <div className="lg:col-span-1">
            <div className="
              sticky top-8
              p-6
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg
              space-y-6
            ">
              {isRental ? (
                <>
                  {/* Rental Application Form */}
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      Solicitar Renta
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      Completa la solicitud y el propietario revisará tu perfil.
                    </p>
                  </div>
                  
                  <RentalApplicationForm 
                    propertyId={property.id}
                    monthlyRent={property.monthlyRent}
                  />
                </>
              ) : (
                <>
                  {/* Sale Property — Offer + Request Info */}
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    ¿Te interesa esta propiedad?
                  </h2>

                  {property.price && (
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${property.price.toLocaleString('es-MX')} MXN
                    </div>
                  )}

                  {/* Primary CTA: Make an Offer */}
                  <MakeOfferModal propertyId={property.id} askingPrice={property.price} />

                  {/* Secondary CTA: Request Info */}
                  <div className="relative flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">o</span>
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                  </div>

                  <ContactRequestModal propertyId={property.id} />
                </>
              )}

              {/* Contact note — seller reaches out to interested buyers */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {isRental
                    ? 'El propietario revisará tu solicitud y se pondrá en contacto contigo directamente.'
                    : 'El vendedor revisará tu solicitud y se pondrá en contacto contigo directamente.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
