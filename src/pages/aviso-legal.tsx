import { Layout } from "@/components/layout/Layout"
import Link from "next/link"

export default function AvisoLegalPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sand">
        <Link href="/" className="text-clay hover:text-clay-dark text-sm font-medium mb-4 inline-block">&larr; Volver</Link>
        <h1 className="text-2xl font-bold text-ink mb-6">Aviso Legal</h1>

        <section className="space-y-4 text-ink-light leading-relaxed">
          <h2 className="text-lg font-semibold text-ink">1. Identidad del titular</h2>
          <p>
            CASA MX es una plataforma operada por [Nombre de la empresa], con domicilio en [Dirección fiscal], 
            México. Para cualquier consulta, contáctanos en contacto@casamx.mx.
          </p>

          <h2 className="text-lg font-semibold text-ink">2. Términos de uso</h2>
          <p>
            El acceso y uso de esta plataforma implica la aceptación de estos términos. 
            Si no estás de acuerdo, por favor no utilices el sitio.
          </p>

          <h2 className="text-lg font-semibold text-ink">3. Propiedad intelectual</h2>
          <p>
            Todos los contenidos, marcas, logos y diseños son propiedad de CASA MX o de sus 
            respectivos titulares y están protegidos por las leyes de propiedad intelectual.
          </p>

          <h2 className="text-lg font-semibold text-ink">4. Limitación de responsabilidad</h2>
          <p>
            CASA MX actúa como intermediario entre propietarios y buscadores de propiedades. 
            No somos responsables por la veracidad de los anuncios publicados por terceros ni 
            por las transacciones realizadas entre las partes.
          </p>

          <h2 className="text-lg font-semibold text-ink">5. Legislación aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier 
            controversia será resuelta ante los tribunales competentes de Hermosillo, Sonora.
          </p>

          <p className="text-sm text-ink-muted pt-8">
            Última actualización: {new Date().toLocaleDateString("es-MX")}
          </p>
        </section>
      </div>
    </Layout>
  )
}
