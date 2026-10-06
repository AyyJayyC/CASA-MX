import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-clay mb-2">404</p>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Página no encontrada
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-clay hover:bg-clay-500 text-white font-semibold rounded-lg transition-all"
        >
          Ver propiedades
        </Link>
      </div>
    </div>
  );
}
