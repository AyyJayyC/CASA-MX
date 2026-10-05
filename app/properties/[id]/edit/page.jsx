"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProperty } from "@/lib/queries/properties";
import PropertyUploadForm from "@/components/PropertyUploadForm.jsx";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireRole } from "@/components/guards/RequireRole";

export default function EditPropertyPage({ params }) {
  return (
    <RequireAuth>
        <RequireRole roles={["owner", "agent", "admin"]}>
        <EditProperty params={params} />
      </RequireRole>
    </RequireAuth>
  );
}

function EditProperty({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: property, isLoading, error } = useProperty(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Propiedad no encontrada
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Esta propiedad no existe o no tienes permiso para editarla.
          </p>
          <button
            onClick={() => router.push("/dashboard/my-properties")}
            className="px-6 py-3 bg-clay hover:bg-clay-500 text-white font-semibold rounded-lg transition-all"
          >
            Volver a Mis Propiedades
          </button>
        </div>
      </div>
    );
  }

  const listingType = property.listingType || "for_sale";

  const initialValues = {
    title: property.title,
    description: property.description || "",
    estado: property.estado || "",
    ciudad: property.ciudad || "",
    colonia: property.colonia || "",
    codigoPostal: property.codigoPostal || "",
    propertyType: property.propertyType || "",
    price: property.price || undefined,
    monthlyRent: property.monthlyRent || undefined,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    squareMeters: property.squareMeters || undefined,
    lotSize: property.lotSize || undefined,
    parkingSpaces: property.parkingSpaces || undefined,
    floors: property.floors || undefined,
    yearBuilt: property.yearBuilt || undefined,
    condition: property.condition || "",
    furnished: property.furnished || false,
    utilitiesIncluded: property.utilitiesIncluded || false,
    petFriendly: property.petFriendly || false,
    childrenWelcome: property.childrenWelcome || false,
    issuesInvoice: property.issuesInvoice || false,
    status: property.status || "",
    visibility: property.visibility || "private",
    address: property.address || "",
    halfBaths: property.halfBaths || undefined,
    maintenanceFee: property.maintenanceFee || undefined,
    securityDeposit: property.securityDeposit || undefined,
    leaseTermMonths: property.leaseTermMonths || undefined,
    availableFrom: property.availableFrom || "",
    includedServices: property.includedServices || [],
    amenities: property.amenities || [],
    financeOptions: property.financeOptions || [],
    mapsUrl: property.mapsUrl || "",
    imageUrls: property.imageUrls || [],
    photos: property.imageUrls || [],
    parkingType: property.parkingType || "",
    miniSplits: property.miniSplits || undefined,
    inventoryNotes: property.inventoryNotes || "",
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Completar propiedad
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Editando: {property.title}
          </p>
          {property.status === "incompleto" && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              ⚠️ Borrador — La propiedad es privada hasta que esté completa
            </span>
          )}
        </div>

        <PropertyUploadForm
          listingType={listingType}
          initialValues={initialValues}
          propertyId={id}
          onSave={() => router.push("/dashboard/my-properties")}
        />
      </div>
    </div>
  );
}
