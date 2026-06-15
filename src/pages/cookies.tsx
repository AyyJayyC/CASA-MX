import Link from "next/link"
import { Layout } from "@/components/layout/Layout"

export default function CookiesPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-clay hover:text-clay-dark text-sm font-medium mb-4 inline-block">&larr; Volver</Link>
        <h1 className="text-2xl font-bold text-ink mb-6">Política de Cookies</h1>
        <section className="space-y-4 text-ink-light leading-relaxed text-sm">
          <p>Utilizamos cookies para mejorar tu experiencia en CASA MX. Las cookies son pequeños archivos que se almacenan en tu navegador.</p>
          <h2 className="text-lg font-semibold text-ink mt-6">Cookies esenciales</h2>
          <p>Necesarias para el funcionamiento básico del sitio: inicio de sesión, seguridad y preferencias de navegación.</p>
          <h2 className="text-lg font-semibold text-ink mt-6">Cookies analíticas</h2>
          <p>Nos ayudan a entender cómo usas el sitio para mejorarlo. No compartimos esta información con terceros.</p>
          <h2 className="text-lg font-semibold text-ink mt-6">Desactivar cookies</h2>
          <p>Puedes desactivar las cookies en la configuración de tu navegador, pero algunas funciones del sitio podrían no estar disponibles.</p>
        </section>
      </div>
    </Layout>
  )
}
