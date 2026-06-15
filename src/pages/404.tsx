import Link from "next/link"
import { Layout } from "@/components/layout/Layout"

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-8xl mb-4">\uD83C\uDFE0</p>
        <h1 className="text-3xl font-bold text-ink mb-2">Página no encontrada</h1>
        <p className="text-ink-muted mb-8 max-w-md">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-clay text-white font-medium rounded-lg hover:bg-clay-dark transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </Layout>
  )
}
