import Link from "next/link";
import { getPropertyById } from "@/lib/api/properties";
import PropertyDetailContent from "@/components/PropertyDetailContent.jsx";

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
            className="inline-flex items-center gap-2 px-6 py-3 bg-clay hover:bg-clay-500 text-white font-semibold rounded-lg transition-all"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    );
  }

  return <PropertyDetailContent property={property} />;
}
